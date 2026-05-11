import os
import csv
from PIL import Image

from ai import encode_image, extract_color_features, extract_shape_features
# Root folder where product images are stored.
# Each subfolder represents a frame style (aviator, round, etc.)
IMAGE_DIR = "data/images"

# CSV file that will hold all product metadata and embeddings.
# This file is loaded by the backend during startup.
META_FILE = "data/metadata.csv"
# Mapping of folder names to readable product styles.
# Keeping this explicit avoids relying on folder naming everywhere else.
STYLE_MAP = {
    "aviator": "Aviator","round": "Round","square": "Square","rimless": "Rimless","transparent":"Transparent",
    "rectangle": "Rectangle",
}
# Simple material rotation to add demo variety.
# This keeps the dataset from feeling artificially uniform.
MATERIALS = ["Metal", "Plastic", "Steel"]
rows = []
pid = 0
def is_valid_image(filename: str) -> bool:
     """Small helper to filter supported image formats."""
     return filename.lower().endswith((".jpg", ".png", ".jpeg", ".webp"))


# Walk through each style folder and convert images into product records
for folder in sorted(os.listdir(IMAGE_DIR)):
    style = STYLE_MAP.get(folder.lower())

    # Skip unknown folders (e.g., stray files or system artifacts)
    if not style:
        continue

    folder_path = os.path.join(IMAGE_DIR, folder)

    for img in sorted(os.listdir(folder_path)):
        if not is_valid_image(img):
            continue

        image_path = os.path.join(folder_path, img)

        # Try loading the image. If an image fails, we skip it instead of
        # breaking the whole dataset generation process.
        try:
            image = Image.open(image_path).convert("RGB")
        except Exception as e:
            print(f"Skipping corrupted image: {image_path} ({e})")
            continue

        # Generate embedding for similarity-based search and recommendations
        # Replace the emb/color/rows.append block with:
        emb   = encode_image(image)[0]
        color = extract_color_features(image)
        shape = extract_shape_features(image)

        rows.append({
            "product_id": pid,
            "image": f"{folder}/{img}",
            "brand": "Lenskart",
            "material": MATERIALS[pid % len(MATERIALS)],
            "price": 1800 + (pid % 6) * 300,
            "style": style,
            "embedding":  " ".join(map(str, emb.tolist())),
            "color_hist": " ".join(map(str, color.tolist())),
            "shape_hist": " ".join(map(str, shape.tolist())),
        })

        pid += 1

# Write all generated products to a CSV file
if rows:
    with open(META_FILE, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)
else:
    print("Warning: No products were generated. Check IMAGE_DIR and folder structure.")

print(f"Generated {pid} products and stored them in {META_FILE}")
