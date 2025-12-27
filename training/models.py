# models/resnet_classifier.py
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision.models import efficientnet_b3, EfficientNet_B3_Weights
import torchvision.transforms as transforms
from config import *

class EfficientNetClassifier(nn.Module):
    """
    Model phân loại với head FC và tuỳ chọn Softmax ở forward.
    - Train với CrossEntropyLoss: set apply_softmax=False (mặc định tốt cho train).
    - Inference muốn xác suất: set apply_softmax=True.
    """
    def __init__(
        self,
        num_classes: int,
        embedding_dim: int = 256,
        pretrained: bool = True,
        apply_softmax: bool = False,
    ):
        super().__init__()
        if pretrained:
            self.backbone = efficientnet_b3(weights=EfficientNet_B3_Weights.DEFAULT)
        else:
            self.backbone = efficientnet_b3(weights=None)

        # Bóc tách fc cuối để lấy feature trước fc
        in_features = self.backbone.classifier[1].in_features
        self.backbone.classifier = nn.Identity()

        # Head embedding
        print(f"Building embedding head: {in_features} -> 512 -> {embedding_dim}")
        self.embedding_layer = nn.Sequential(
            nn.Linear(in_features, 512),
            nn.BatchNorm1d(512),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(512, embedding_dim),
        )
        self.classifier = nn.Linear(embedding_dim, num_classes)
        self.apply_softmax = apply_softmax

        self.transform = transforms.Compose([
            transforms.Resize((IMG_SIZE, IMG_SIZE)),
            transforms.ToTensor(),
            transforms.Normalize(mean=NORM_MEAN,
                                 std=NORM_STD),
        ])

    def forward(self, x):
        feats = self.backbone(x)
        emb = self.embedding_layer(feats)     
        logits = self.classifier(emb)      
        if self.apply_softmax:
            return F.softmax(logits, dim=1)
        return logits

    @torch.no_grad()
    def predict_proba(self, pil_image, device: torch.device):
        """
        Nhận 1 ảnh PIL, trả về xác suất C lớp.
        """
        self.eval()
        x = self.transform(pil_image).unsqueeze(0).to(device)
        logits = self.forward(x)
        probs = F.softmax(logits, dim=1) if not self.apply_softmax else logits
        return probs.squeeze(0).cpu()

