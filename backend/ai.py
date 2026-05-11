import torch
from transformers import CLIPModel, CLIPProcessor
# ADD this import at top
import numpy as np

MODEL = "openai/clip-vit-base-patch32"

# Choose device cpu or gpu prefer gpu if available
def choose_device():
    return torch.device("cuda") if torch.cuda.is_available() else torch.device("cpu")
device = choose_device()
print("CLIP running on:", device)

model = CLIPModel.from_pretrained(MODEL).to(device)
model.eval()

processor = CLIPProcessor.from_pretrained(MODEL)
@torch.no_grad()
def encode_image(img):
    # quick sanity check
    if img is None:
        raise RuntimeError("embed_image() called with empty image")

    batch = processor(images=img, return_tensors="pt").to(device)
    vec = model.get_image_features(**batch)

    # normalize so we can compare vectors directly
    vec = vec / vec.norm(dim=-1, keepdim=True)

    return vec.cpu().numpy().astype("float32")


# ADD this new function after encode_image()
def extract_color_features(img, bins=16):
    """
    Extract an RGB color histogram from the center crop of the image.
    Center crop focuses on the frame itself, ignoring background noise.
    Returns a normalized float32 vector of length bins*3 = 48.
    """
    w, h = img.size
    # Crop center 60% to focus on the frame
    crop = img.crop((w * 0.2, h * 0.2, w * 0.8, h * 0.8))
    crop = crop.resize((64, 64))
    arr = np.array(crop).astype(np.float32)  # shape: (64, 64, 3)

    features = []
    for channel in range(3):  # R, G, B
        hist, _ = np.histogram(arr[:, :, channel], bins=bins, range=(0, 256))
        hist = hist / (hist.sum() + 1e-7)  # normalize to sum=1
        features.append(hist)

    return np.concatenate(features).astype("float32")  # shape: (48,)

def extract_shape_features(img, bins=12):
    """
    Gradient-based shape descriptor using numpy only.
    Captures frame edges and geometry across a 3x3 spatial grid.
    """
    w, h = img.size
    crop = img.crop((w * 0.15, h * 0.15, w * 0.85, h * 0.85))
    crop = crop.resize((64, 64)).convert("L")
    arr = np.array(crop).astype(np.float32)

    gx = np.zeros_like(arr)
    gx[:, 1:-1] = arr[:, 2:] - arr[:, :-2]
    gy = np.zeros_like(arr)
    gy[1:-1, :] = arr[2:, :] - arr[:-2, :]

    magnitude = np.sqrt(gx**2 + gy**2)
    direction = np.arctan2(gy, gx)

    cell_h, cell_w = 64 // 3, 64 // 3
    features = []
    for row in range(3):
        for col in range(3):
            r0, r1 = row * cell_h, (row + 1) * cell_h
            c0, c1 = col * cell_w, (col + 1) * cell_w
            cell_mag = magnitude[r0:r1, c0:c1].ravel()
            cell_dir = direction[r0:r1, c0:c1].ravel()
            mag_hist, _ = np.histogram(cell_mag, bins=bins, range=(0, 360))
            dir_hist, _ = np.histogram(cell_dir, bins=bins, range=(-np.pi, np.pi))
            mag_hist = mag_hist / (mag_hist.sum() + 1e-7)
            dir_hist = dir_hist / (dir_hist.sum() + 1e-7)
            features.extend([mag_hist, dir_hist])

    return np.concatenate(features).astype("float32")