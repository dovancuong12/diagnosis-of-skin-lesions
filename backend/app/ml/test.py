import torch
import torchvision.transforms as transforms
import cv2
from PIL import Image
from efficientnet_model import EfficientNetClassifier


def load_model_cls(model_path: str, device):
    print(f"Loading model from: {model_path}")
    
    ckpt = torch.load(model_path, map_location=device, weights_only=False)
    idx_to_class = ckpt["idx_to_class"]

    model = EfficientNetClassifier(
        num_classes=len(idx_to_class),
        embedding_dim=256,
        pretrained=True,
        apply_softmax=True
    ).to(device)

    model.load_state_dict(ckpt["model_state_dict"])
    model.transform = transforms.Compose([
            transforms.Resize((300, 300)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.7539897561073303, 0.5854063034057617, 0.5899980068206787],
                                 std=[0.12629127502441406, 0.14309869706630707, 0.15721528232097626]),
    ])
    model.eval()
    
    print(f"Model loaded! Classes: {list(idx_to_class.values())}")
    return model, idx_to_class

def predict_class(model, idx_to_class, image):
    try:
        image_rgb = Image.fromarray(image).convert("RGB")
        with torch.no_grad():
            probs = model.predict_proba(image_rgb, device)
        pred_idx = torch.argmax(probs).item()
        pred_class = idx_to_class[pred_idx]
        return pred_class
    except Exception as e:
        print(e)

if __name__ == "__main__":
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"model chạy trên {device}")
    model, idx_class = load_model_cls(model_path="backend/app/ml/model/best_model.pth", device=device)
    
    img_path = "backend/uploads/c.jpg"
    img = cv2.imread(img_path)
    result_class = predict_class(model, idx_class, img)
    print(f"bệnh: {result_class}")


