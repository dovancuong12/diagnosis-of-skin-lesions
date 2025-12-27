import os
import torch


def save_last_ckpt(
    path,
    epoch,
    model,
    optimizer,
    scheduler,
    scaler,
    training_phase,
    idx_to_class=None,
    hparams=None,
):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    torch.save(
        {
            "epoch": epoch,
            "model_state": model.state_dict(),
            "optimizer_state": optimizer.state_dict(),
            "scheduler_state": scheduler.state_dict() if scheduler else None,
            "scaler_state": scaler.state_dict() if scaler else None,
            "training_phase": training_phase,
            "idx_to_class": idx_to_class,
            "hparams": hparams,
        },
        path,
    )


def load_last_ckpt(
    path,
    model,
    optimizer,
    scheduler,
    scaler,
    device,
):
    if not os.path.exists(path):
        return None

    ckpt = torch.load(path, map_location=device)

    model.load_state_dict(ckpt["model_state"], strict=True)
    optimizer.load_state_dict(ckpt["optimizer_state"])

    if scheduler and ckpt.get("scheduler_state") is not None:
        scheduler.load_state_dict(ckpt["scheduler_state"])

    if scaler and ckpt.get("scaler_state") is not None:
        scaler.load_state_dict(ckpt["scaler_state"])

    return {
        "start_epoch": ckpt["epoch"] + 1,
        "training_phase": ckpt.get("training_phase"),
        "idx_to_class": ckpt.get("idx_to_class"),
        "hparams": ckpt.get("hparams"),
    }
