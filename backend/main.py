from fastapi import FastAPI, UploadFile, File, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from PIL import Image
from ai import encode_image
from store import VectorStore
from feedback import get_boost
from feedback import record_click
from contextlib import asynccontextmanager
from accuracy_test import run_accuracy_check
# Replace the two ai imports at the top with one:
from ai import encode_image, extract_color_features, extract_shape_features
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("\nStarting backend health check...\n")
    run_accuracy_check()     # runs once at startup
    yield
    print("\nBackend ready.\n")

app = FastAPI(title="Visual Product API", lifespan=lifespan)
app.mount("/images", StaticFiles(directory="data/images"), name="images")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
store = VectorStore()
PRODUCTS = {}
SEARCH_BASE = "https://www.lenskart.com/search?q="

import csv
with open("data/metadata.csv", newline="", encoding="utf-8") as f:
    for r in csv.DictReader(f):
        r["image"] = r["image"].replace("images/", "")
        PRODUCTS[int(r["product_id"])] = r

#*****Helper function to tag images*****#
def tag_image(image):
    try:
        return store.classify(encode_image(image))
    except Exception:
        return None

#*****AI search endpoints*****#    
@app.post("/search")
async def search(
    file: UploadFile = File(...),
    min_price: int = Query(0, ge=0),
    max_price: int = Query(10000, ge=0),
    material: str | None = None,
    style: str | None = None,
    frame: str | None = None
):
    # Only guard image decoding – this is the most common real-world failure
    try:
        img = Image.open(file.file).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")
    q       = encode_image(img)
    color_q = extract_color_features(img)
    shape_q = extract_shape_features(img)

    if not store.is_eyewear(q):
        raise HTTPException(
            status_code=400,
            detail="No eyewear detected. Please upload a glasses image."
        )

    tag = tag_image(img)
    raw = store.search(q, k=60, color_query=color_q, shape_query=shape_q)
    results = []

    for item, score in raw:
        pid = int(item["product_id"])
        p = PRODUCTS.get(pid)
        if not p:
            continue

        price = int(p["price"])
        if not (min_price <= price <= max_price): continue
        if material and p["material"] != material: continue
        if style and p["style"] != style: continue
        if frame and p["style"] != frame: continue

        r = {k: v for k, v in p.items() if k not in ("embedding", "color_hist", "shape_hist")}
        r["score"] = float(score) * float(get_boost(pid))
        r["image_url"] = f"http://localhost:8000/images/{r['image']}"
        r["buy_url"] = SEARCH_BASE + f"{r['style']} {r['material']} glasses under {r['price']}".replace(" ", "+")
        results.append(r)

    results.sort(key=lambda x: float(x["score"]), reverse=True)
    return {"tag": tag, "results": [{**r, "score": float(r["score"])} for r in results[:8]]}

#*****Product CATALOG ENDPOINT*****# 
@app.get("/products")
def products():
     out = []

     for pid, p in PRODUCTS.items():
         r = {k: v for k, v in p.items() if k != "embedding"}
         r["boost"] = float(get_boost(pid))
         r["image_url"] = f"http://localhost:8000/images/{r['image']}"
         r["buy_url"] = SEARCH_BASE + f"{r['style']} {r['material']} glasses under {r['price']}".replace(" ", "+")
         out.append(r)

     out.sort(key=lambda x: x["boost"], reverse=True)
     return {"count": len(out), "results": out}
#*****Feedback endpoint to record clicks*****#
@app.post("/click/{pid}")
def click(pid: int):
    record_click(pid)
    return {"status": "ok"}
