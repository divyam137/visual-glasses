"use client";
import { Upload } from "lucide-react";
import { useState, useEffect } from "react";
import ColourfulText from "../UI/colourful-text.jsx";

const STYLES = ["Aviator","Round","Square","Rimless","Transparent","Rectangle"];
const MATERIALS = ["Metal","Plastic","Steel"];

export default function ScannerBox({
  onScan,
   style,
  material,
  setStyle,
    setMaterial,
  tag,
   loading,
  error
}) {
  // preview is just for showing the image in UI,
  // file is what we actually send to backend
  const [preview, setPreview] = useState(null);
   const [file, setFile] = useState(null);

  // simple price range filter
  const [minPrice, setMinPrice] = useState(500);
   const [maxPrice, setMaxPrice] = useState(4000);

  // used only to add drag-and-drop highlight
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    // try to restore last image preview (nice UX touch)
    const saved = localStorage.getItem("last_preview");
      if (saved) setPreview(saved);
  }, []);

  const handleFile = (f) => {
     if (!f) return;

    // whenever a new image is picked,
    // this reset old filters to avoid confusing results
    setStyle(null);
     setMaterial(null);
    setFile(f);

    const reader = new FileReader();
     reader.onload = () => {
      setPreview(reader.result);
       localStorage.setItem("last_preview", reader.result);
    };
    reader.readAsDataURL(f);
  };

  const handleDrop = (e) => {
     e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/5 backdrop-blur-xl p-3 space-y-3 shadow-xl hover:scale-[1.01] transition">

      <p className="text-xl text-center text-zinc-400">
        <ColourfulText text="Find Your Next Lenses" />
      </p>

      {/* image drop / preview area */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setDragging(true)}
          onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`group h-48 rounded-xl border flex items-center justify-center overflow-hidden transition shadow-xl
          ${dragging ? "border-indigo-500 bg-indigo-500/10 scale-[1.02]" : "border-indigo-400/40"}`}
      >
        {preview ? (
          <img src={preview} className="h-full object-contain" />
        ) : (
          <div className="flex flex-col items-center text-zinc-500 text-xs">
            <Upload size={30} className="mb-1 opacity-60 group-hover:scale-110 transition" />
            Drop image here
          </div>
        )}
      </div>

      {tag && (
        <p className="text-zinc-500 text-xs text-center">
          Frame-Type: <span className="font-semibold text-black">{tag}</span>
        </p>
      )}

      {/* native file picker */}
      <label htmlFor="file"
        className="block w-full shadow-xl cursor-pointer font-semibold rounded-lg border border-black py-2 text-black text-sm text-center
        hover:bg-indigo-400/40 hover:shadow-2xl transition hover:scale-[1.02]"
      >
        Choose Image
      </label>

      <input id="file" type="file" accept="image/*" hidden
         onChange={(e) => handleFile(e.target.files?.[0])} />

     {/* simple price filter */}
      <div>
        <p className="text-xs font-semibold text-black mb-1">Price Range (₹)</p>
        <div className="flex items-center gap-2">
          <input type="number" value={minPrice}
            onChange={(e) => setMinPrice(+e.target.value)}
            className="w-20 rounded border-2 text-black px-2 py-1 text-xs" />

          <span className="text-xs text-black">to</span>

          <input type="number" value={maxPrice}
             onChange={(e) => setMaxPrice(+e.target.value)}
            className="w-20 rounded border-2 text-black px-2 py-1 text-xs" />
        </div>
      </div>

      <Filter title="Frame Style" list={STYLES} value={style} setValue={setStyle} />
      <Filter title="Material" list={MATERIALS} value={material} setValue={setMaterial} />

      {!file && preview && (
        <p className="text-[10px] text-center text-zinc-500">
          Please re-select the image to scan again
        </p>
      )}

      {/* scan button – disabled until an image is selected */}
      <button
        disabled={!file || loading}
        onClick={() => onScan(file, minPrice, maxPrice)}
        className={`block w-full shadow-xl cursor-pointer font-semibold rounded-lg border border-black py-2 text-black text-sm text-center
          hover:bg-indigo-400/40 hover:shadow-2xl transition hover:scale-[1.02]
          ${(!file || loading) ? "opacity-40 cursor-not-allowed" : ""}`}
      >
        {loading ? "Scanning…" : "Scan Now"}
      </button>

     {/* status / error messages */}
      <div className="space-y-1 text-center text-xs pt-1">
        {loading && <p className="text-indigo-500 animate-pulse">Scanning your image…</p>}
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </div>
  );
}

function Filter({ title, list, value, setValue }) {
  return (
    <div>
      <p className="text-xs font-semibold text-black mb-2">{title}</p>
      <div className="flex flex-wrap gap-2">
        {list.map((i) => (
          <button
            key={i}
            onClick={() => setValue(value === i ? null : i)}
            className={`px-3 py-1.5 rounded-full text-xs transition
              ${value === i ? "text-black shadow-md bg-gray-300 scale-[1.09]" : "border text-black"}`}
          >
            {i}
          </button>
        ))}
      </div>
    </div>
  );
}
