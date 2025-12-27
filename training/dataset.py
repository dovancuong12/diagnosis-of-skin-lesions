import os
import torch
from torchvision import datasets, transforms
from torch.utils.data import DataLoader
from tqdm import tqdm


def compute_mean_std(data_dir: str, batch_size: int = 64, num_workers: int = 4):
    """
    Tính mean và std cho toàn bộ dataset (3 kênh RGB).
    """
    # Transform: chỉ resize + tensor, KHÔNG normalize
    transform = transforms.Compose([
        transforms.Resize((224, 224)),  # hoặc giữ nguyên nếu muốn
        transforms.ToTensor()
    ])

    dataset = datasets.ImageFolder(data_dir, transform=transform)
    loader = DataLoader(dataset, batch_size=batch_size, shuffle=False,
                        num_workers=num_workers, pin_memory=True)

    n_images = 0
    mean = torch.zeros(3)
    std = torch.zeros(3)

    print("▶ Đang tính mean và std ...")
    for images, _ in tqdm(loader):
        # images shape: [B, C, H, W]
        b, c, h, w = images.shape
        n_pixels = b * h * w

        mean += images.sum(dim=[0, 2, 3])
        std += (images ** 2).sum(dim=[0, 2, 3])
        n_images += n_pixels

    mean /= n_images
    std = torch.sqrt(std / n_images - mean ** 2)

    return mean, std


if __name__ == "__main__":
    # ví dụ: data/train hoặc data toàn bộ
    data_dir = r"C:\Users\PC\Downloads\output_class"

    mean, std = compute_mean_std(data_dir)
    print(f"\n✅ Mean: {mean.tolist()}")
    print(f"✅ Std:  {std.tolist()}\n")
    print("Bạn có thể copy vào Normalize như sau:")
    print(f"transforms.Normalize(mean={mean.tolist()}, std={std.tolist()})")
