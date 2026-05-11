"use client";
import { useState, useEffect, useCallback, useTransition } from "react";
import dynamic from "next/dynamic";
import ResultsDeck from "./UI/ResultsDeck";

const ScannerBox = dynamic(() => import("./UI/ScannerBox"), {
  ssr: false,
  loading: () => (
    <div className="
      h-115
       rounded-2xl
      border border-white/10
       bg-black/5 backdrop-blur-xl
        animate-pulse
    " />
  ),
});

const API_BASE = "http://localhost:8000";

export default function Home() {
  const [tag, setTag] = useState("");
   const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");
  const [style, setStyle] = useState(null);
   const [material, setMaterial] = useState(null);
  const [isPending, startTransition] = useTransition();

  const scan = useCallback(async (file, minPrice, maxPrice) => {
    try {
      setLoading(true);
      setError("");
      startTransition(() => setResults([]));

      const form = new FormData();
      form.append("file", file);

      // build query string based on current filters
      const url = new URL(`${API_BASE}/search`);
       if (minPrice) url.searchParams.set("min_price", minPrice);
      if (maxPrice) url.searchParams.set("max_price", maxPrice);
       if (style) url.searchParams.set("style", style);
      if (material) url.searchParams.set("material", material);

      const res = await fetch(url, { method: "POST", body: form });
      if (!res.ok) throw new Error();

      const data = await res.json();
       setTag(data.tag);
      startTransition(() => setResults(data.results));

      // remember last scan so refresh doesn’t wipe everything
      localStorage.setItem("vg_last_results", JSON.stringify(data.results));
      localStorage.setItem("vg_last_tag", data.tag);
     } catch {
       setError("Blurry/Does don't have glasses in It.");
     } finally {
       setLoading(false);
    }
  }, [style, material]);

  useEffect(() => {
    try {
      // restore previous scan (if any)
       const r = localStorage.getItem("vg_last_results");
       const t = localStorage.getItem("vg_last_tag");
       if (r) setResults(JSON.parse(r));
        if (t) setTag(t);
    } catch {}
  }, []);

  useEffect(() => {
    // clean local cache on full page close
      const handleUnload = () => {
      localStorage.removeItem("vg_last_results");
      localStorage.removeItem("vg_last_tag");
      localStorage.removeItem("last_preview");
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  return (
    <div className="min-h-screen flex justify-center px-10">
      <div className="w-full pt-14 pb-20">
        <div className="
          grid
           grid-cols-1
          md:grid-cols-[360px_1fr]
           gap-14
        ">
          <aside className="px-2 space-y-4">
            <ScannerBox
              onScan={scan}
              style={style}
              material={material}
              setStyle={setStyle}
              setMaterial={setMaterial}
              tag={tag}
              loading={loading || isPending}
              error={error}
            />
          </aside>

          <section>
            <ResultsDeck results={results} loading={loading || isPending} />
        </section>
    </div>
     </div>
    </div>
  );
}
