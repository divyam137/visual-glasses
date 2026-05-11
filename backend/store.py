import csv
import os
import faiss
import numpy as np
from collections import defaultdict
BASE_DIR = os.path.dirname(__file__)
META_FILE = os.path.join(BASE_DIR, "data/metadata.csv")
INDEX_FILE = os.path.join(BASE_DIR, "index.faiss")
CENTROID_FILE = os.path.join(BASE_DIR, "centroids.npy")
# CLIP embedding dimension (fixed)
DIM = 512
class VectorStore:
    """
    FAISS based vector store for:
    - similarity search
    - rough style classification
    """
    def is_eyewear(self, q, threshold=0.30):
     q = q / np.linalg.norm(q, axis=1, keepdims=True)

     scores = [float(np.dot(q[0], c)) for c in self.centroids.values()]
     return max(scores) > threshold


    # In __init__, add one line:
    def __init__(self):
        self.meta = self._load_meta()
        self.color_features = self._load_color_features()
        self.shape_features = self._load_feature_column("shape_hist")  # ADD
        if os.path.exists(INDEX_FILE):
            self.index = faiss.read_index(INDEX_FILE)
        else:
            self._build_index()
        self._build_centroids() 
    def _load_meta(self):
        with open(META_FILE, newline="", encoding="utf-8") as f:
            rows = list(csv.DictReader(f))
            print(f"Loaded {len(rows)} products from metadata")
            return rows
    def _load_color_features(self):
        """
        Load precomputed color histograms from metadata.
        Falls back gracefully if the column doesn't exist yet.
        """
        features = {}
        for r in self.meta:
            if "color_hist" not in r or not r["color_hist"]:
                continue
            pid = int(r["product_id"])
            vec = np.fromstring(r["color_hist"], sep=" ").astype("float32")
            norm = np.linalg.norm(vec)
            features[pid] = vec / norm if norm > 0 else vec
        print(f"[VectorStore] Loaded color features for {len(features)} products")
        return features    
    def _load_feature_column(self, column_name):
        features = {}
        for r in self.meta:
            if column_name not in r or not r[column_name]:
                continue
            pid = int(r["product_id"])
            vec = np.fromstring(r[column_name], sep=" ").astype("float32")
            norm = np.linalg.norm(vec)
            features[pid] = vec / norm if norm > 0 else vec
        print(f"[VectorStore] Loaded '{column_name}' for {len(features)} products")
        return features

    def _build_index(self):
        vectors = []
        for r in self.meta:
            v = np.fromstring(r["embedding"], sep=" ").astype("float32")
            v = v / np.linalg.norm(v)   # normalize stored vectors
            vectors.append(v)

        vectors = np.vstack(vectors)
        self.index = faiss.IndexFlatIP(DIM)
        self.index.add(vectors)
        faiss.write_index(self.index, INDEX_FILE)

        print(f"[VectorStore] Built FAISS index with {self.index.ntotal} vectors")

    def _build_centroids(self):
        clusters = defaultdict(list)
        for r in self.meta:
            v = np.fromstring(r["embedding"], sep=" ").astype("float32")
            v = v / np.linalg.norm(v)   # normalize before clustering
            clusters[r["style"]].append(v)
        self.centroids = {}
        for style, vecs in clusters.items():
            c = np.mean(vecs, axis=0)
            c = c / np.linalg.norm(c)   # normalize centroid
            self.centroids[style] = c
        np.save(CENTROID_FILE, self.centroids)
        print(f"Built {len(self.centroids)} normalized style centroids")

    # Replace the entire search() method:
    def search(self, q, k=40, color_query=None, shape_query=None,
            color_weight=0.35, shape_weight=0.35):
        """
        Three-way hybrid scoring:
        CLIP semantic : 45%  (broad style match)
        Shape         : 30%  (frame geometry)
        Color         : 25%  (frame color)
        """
        q = q / np.linalg.norm(q, axis=1, keepdims=True)
        clip_weight = 1.0 - color_weight - shape_weight

        fetch_k = min(k * 4, self.index.ntotal)
        D, I = self.index.search(q, fetch_k)

        results = []
        for i, clip_score in zip(I[0], D[0]):
            if i < 0:
                continue
            item = self.meta[i]
            pid = int(item["product_id"])

            final_score = clip_weight * float(clip_score)

            if shape_query is not None and pid in self.shape_features:
                sq = shape_query / (np.linalg.norm(shape_query) + 1e-7)
                final_score += shape_weight * float(np.dot(sq, self.shape_features[pid]))

            if color_query is not None and pid in self.color_features:
                cq = color_query / (np.linalg.norm(color_query) + 1e-7)
                final_score += color_weight * float(np.dot(cq, self.color_features[pid]))

            results.append((item, final_score))

        results.sort(key=lambda x: x[1], reverse=True)
        return [(item, float(score)) for item, score in results[:k]]
   
    def classify(self, q):
        q = q / np.linalg.norm(q, axis=1, keepdims=True)
        best_style, best_score = None, -1
        for style, centroid in self.centroids.items():
            score = float(np.dot(q[0], centroid))
            if score > best_score:
                best_style, best_score = style, score

        return best_style
