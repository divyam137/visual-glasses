from PIL import Image
from ai import encode_image
from store import VectorStore
import os

def run_accuracy_check():
    store = VectorStore()

    top1_correct = 0
    top5_correct = 0
    total = 0

    TEST_DIR = "data/images"

    print("\nRunning accuracy evaluation...\n")

    for style in os.listdir(TEST_DIR):
        folder = os.path.join(TEST_DIR, style)
        if not os.path.isdir(folder):
            continue

        for img_name in os.listdir(folder):
            path = os.path.join(folder, img_name)
            img = Image.open(path).convert("RGB")

            q = encode_image(img)
            results = store.search(q, k=5)

            if results:
                if img_name in results[0][0]["image"]:
                    top1_correct += 1

                all_matches = [r[0]["image"] for r in results]
                if any(img_name in m for m in all_matches):
                    top5_correct += 1

            total += 1

    print("Evaluation Complete")
    print("----------------------------")
    print(f"Total Images Tested : {total}")
    print(f"Top-1 Accuracy      : {round(top1_correct / total * 100, 2)}%")
    print(f"Top-5 Recall        : {round(top5_correct / total * 100, 2)}%")
    print("----------------------------\n")
