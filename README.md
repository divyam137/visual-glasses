# 👓 Visual Eyewear Search & Recommendation System

This is a full-stack AI based visual search system for eyewear.

Users can upload an image of glasses and the system instantly finds visually similar frames from the product catalog.  
The current catalog contains **101 eyewear frames**, and more can easily be added.

Instead of relying only on text filters, the system understands how a frame looks and uses that to match it with similar products — similar to how modern shopping platforms support image-based search.

The goal of the project was to build and understand a real visual recommendation pipeline from scratch using deep learning embeddings and vector similarity search.

i have added sample images through which model working can be analyzed it accepts image of mostly all types

---

## 🌍 Live Deployment

### 🔗 Frontend Web App (Netlify)

https://visualsearch3831.netlify.app/

### 🔗 Backend + AI API (HuggingFace Spaces)

---

## 🏗 Architecture Diagram

📐 [Click here to view system architecture](ArchitectureDiagram.png)

---

## ▶To Run locally

### Backend (Development)

```bash
cd backend
pip install -r requirements.txt
python run.py
```

### 🖥️ Frontend (Development)

```bash
cd frontend
npm install
npm run dev
```
---

## 🔍 What this project does

1. Takes an image of eyewear from the user  
2. Converts the image into a numerical representation using a deep learning model  
3. Searches a vector index to find visually similar products  
4. Applies filters like price, material and style  
5. Adjusts ranking based on user clicks  
6. Returns the best matching frames in real time  

---

## 🛠 Tech Stack

- **Frontend:** Next.js, Tailwind CSS  
- **Backend:** FastAPI  
- **Image Model:** CLIP 
- **Vector Search:** FAISS  
- **Image Processing:** Pillow  
- **Storage:** CSV + FAISS index + NumPy centroids  

---

## 🧠 Why CLIP?

CLIP is used to convert each product image into a **512-dimensional vector** that represents its visual features.

It works well without custom training and produces consistent embeddings, making it a great choice for visual similarity search and recommendations.

---

## 📐 How similarity is calculated

All embeddings are normalized and stored in a FAISS index using `IndexFlatIP`.

Since the vectors are normalized, inner product behaves like **cosine similarity**, which compares how similar two images look rather than how large their vectors are.  
This gives stable and meaningful similarity rankings.

---

## ⚙️ How the pipeline works

- All product images are processed once to generate embeddings  
- These embeddings are normalized and indexed using FAISS  
- Style-wise centroid vectors are computed for basic auto-tagging  

When a user uploads an image:

- Its embedding is generated  
- FAISS returns the most visually similar frames  
- Filters are applied  
- Popularity boosts are added using click feedback  
- The top results are returned to the frontend  

---

## 📊 Accuracy

The system was evaluated by running every product image as a query against the catalog.

| Metric | Result |
|------|------|
| Top-1 Accuracy | **99.01%** |
| Top-5 Recall | **100%** |

This means the correct product almost always appears as the top result.





