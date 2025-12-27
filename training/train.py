import os
import time
import random

import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms
from torch.utils.data import DataLoader
from torchvision.transforms import InterpolationMode as IM
from tqdm import tqdm
from sklearn.metrics import precision_score, recall_score, f1_score

from models import EfficientNetClassifier
from early_stop import EarlyStopping
from checkpoint import save_last_ckpt, load_last_ckpt
from config import *


def set_seed(seed):
    random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False


def freeze_backbone(model):
    for n, p in model.named_parameters():
        p.requires_grad = ("backbone" not in n)
    print("🧊 Phase = HEAD (freeze backbone)")


def unfreeze_all(model):
    for p in model.parameters():
        p.requires_grad = True
    print("🔥 Phase = FINETUNE (unfreeze all)")


def build_loaders():
    train_tfms = transforms.Compose([
        transforms.RandomResizedCrop(IMG_SIZE, scale=(0.8, 1.0), interpolation=IM.BILINEAR),
        transforms.RandomHorizontalFlip(0.5),
        transforms.RandomRotation(10),
        transforms.ToTensor(),
        transforms.Normalize(NORM_MEAN, NORM_STD),
    ])

    val_tfms = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(NORM_MEAN, NORM_STD),
    ])

    train_ds = datasets.ImageFolder(os.path.join(DATA_DIR, "train"), train_tfms)
    val_ds = datasets.ImageFolder(os.path.join(DATA_DIR, "val"), val_tfms)

    train_loader = DataLoader(
        train_ds, BATCH_SIZE, shuffle=True,
        num_workers=NUM_WORKERS, pin_memory=True
    )
    val_loader = DataLoader(
        val_ds, BATCH_SIZE, shuffle=False,
        num_workers=NUM_WORKERS, pin_memory=True
    )

    idx_to_class = {v: k for k, v in train_ds.class_to_idx.items()}
    return train_loader, val_loader, idx_to_class



def train_one_epoch(model, loader, criterion, optimizer, device, scaler, scheduler):
    model.train()
    total_loss, correct, total = 0, 0, 0
    use_amp = scaler is not None

    for x, y in tqdm(loader, leave=False):
        x, y = x.to(device), y.to(device)
        optimizer.zero_grad(set_to_none=True)

        with torch.amp.autocast("cuda", enabled=use_amp):
            logits = model(x)
            loss = criterion(logits, y)

        if use_amp:
            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()
        else:
            loss.backward()
            optimizer.step()

        scheduler.step()

        total_loss += loss.item() * x.size(0)
        correct += (logits.argmax(1) == y).sum().item()
        total += y.size(0)

    return total_loss / total, correct / total


@torch.no_grad()
def evaluate(model, loader, criterion, device):
    model.eval()
    total_loss, correct, total = 0, 0, 0
    preds, labels = [], []

    for x, y in tqdm(loader, leave=False):
        x, y = x.to(device), y.to(device)
        with torch.amp.autocast("cuda", enabled=(device.type == "cuda")):
            logits = model(x)
            loss = criterion(logits, y)

        total_loss += loss.item() * x.size(0)
        p = logits.argmax(1)
        correct += (p == y).sum().item()
        total += y.size(0)

        preds.extend(p.cpu().tolist())
        labels.extend(y.cpu().tolist())

    acc = correct / total
    p = precision_score(labels, preds, average="macro", zero_division=0)
    r = recall_score(labels, preds, average="macro", zero_division=0)
    f1 = f1_score(labels, preds, average="macro", zero_division=0)

    return total_loss / total, acc, p, r, f1


# hàm train chính
def main():
    set_seed(SEED)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    train_loader, val_loader, idx_to_class = build_loaders()

    model = EfficientNetClassifier(
        num_classes=len(idx_to_class),
        embedding_dim=EMBEDDING_DIM,
        pretrained=PRETRAINED,
        apply_softmax=False
    ).to(device)

    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
    scaler = torch.amp.GradScaler("cuda") if USE_AMP and device.type == "cuda" else None

    steps_per_epoch = len(train_loader)

    
    
    training_phase = None
    start_epoch = 1

    optimizer = optim.AdamW(model.parameters(), lr=LR_FULL, weight_decay=WEIGHT_DECAY)
    scheduler = optim.lr_scheduler.OneCycleLR(
        optimizer,
        max_lr=LR_FULL,
        total_steps=EPOCHS * steps_per_epoch,
        pct_start=0.1,
        anneal_strategy="cos",
    )

    # resumt train tiếp nếu bị ngắt giữa chừng
    if os.path.exists(LAST_MODEL):
        print("🔁 Resume from LAST_MODEL")
        meta = load_last_ckpt(
            LAST_MODEL,
            model,
            optimizer,
            scheduler,
            scaler,
            device
        )
        start_epoch = meta["start_epoch"]
        training_phase = meta["training_phase"]
        

    elif os.path.exists(BEST_MODEL):
        print("🔥 Load BEST_MODEL (finetune)")
        ckpt = torch.load(BEST_MODEL, map_location=device)
        model.load_state_dict(ckpt["model_state"], strict=True)
        training_phase = "finetune"

    else:
        print("🆕 Train from scratch")
        freeze_backbone(model)
        training_phase = "head"
        optimizer = optim.AdamW(
            filter(lambda p: p.requires_grad, model.parameters()),
            lr=LR_FROZEN,
            weight_decay=WEIGHT_DECAY
        )
        scheduler = optim.lr_scheduler.OneCycleLR(
            optimizer,
            max_lr=LR_FROZEN,
            total_steps=FREEZE_EPOCHS * steps_per_epoch,
            pct_start=0.3,
            anneal_strategy="cos",
        )

    early_stop = EarlyStopping(BEST_MODEL, patience=8)


    for epoch in range(start_epoch, EPOCHS + 1):
        t0 = time.time()

        if training_phase == "head" and epoch == FREEZE_EPOCHS + 1:
            unfreeze_all(model)
            training_phase = "finetune"
            optimizer = optim.AdamW(model.parameters(), lr=LR_FULL, weight_decay=WEIGHT_DECAY)
            scheduler = optim.lr_scheduler.OneCycleLR(
                optimizer,
                max_lr=LR_FULL,
                total_steps=(EPOCHS - FREEZE_EPOCHS) * steps_per_epoch,
                pct_start=0.1,
                anneal_strategy="cos",
            )

        train_loss, train_acc = train_one_epoch(
            model, train_loader, criterion,
            optimizer, device, scaler, scheduler
        )

        val_loss, val_acc, p, r, f1 = evaluate(model, val_loader, criterion, device)

        print(
            f"[Epoch {epoch}/{EPOCHS}] phase={training_phase} | "
            f"train_loss={train_loss:.4f} acc={train_acc:.4f} | "
            f"val_loss={val_loss:.4f} acc={val_acc:.4f} | "
            f"P={p:.3f} R={r:.3f} F1={f1:.3f} | {time.time()-t0:.1f}s"
        )

        early_stop(
            val_loss,
            model,
            extra={
                "training_phase": training_phase,
                "idx_to_class": idx_to_class,
                "hparams": {
                    "arch": "efficientnet_b3",
                    "num_classes": len(idx_to_class),
                    "embedding_dim": EMBEDDING_DIM,
                }
            }
        )

        save_last_ckpt(
            LAST_MODEL,
            epoch,
            model,
            optimizer,
            scheduler,
            scaler,
            training_phase,
            idx_to_class,
            {
                "arch": "efficientnet_b3",
                "num_classes": len(idx_to_class),
                "embedding_dim": EMBEDDING_DIM,
            }
        )

        if early_stop.early_stop:
            break

    print("✅ Training completed")


if __name__ == "__main__":
    main()
