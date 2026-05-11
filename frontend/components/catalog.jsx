"use client";

import { useEffect, useState } from "react";
import ResultCard from "@/components/UI/ResultCard";
import ResultsLoader from "@/components/UI/ResultsLoader";
import ColourfulText from "./UI/colourful-text.jsx";

export default function Catalog() {
  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // grab full catalog once on page load
    fetch("http://127.0.0.1:8000/products")
      .then(r => r.json())
      .then(d => {
         setProducts(d.results || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <ResultsLoader />;

  if (!products || !products.length) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-zinc-500">
        No frames found
      </div>
    );
  }

  return (
    <div className="
      min-h-screen px-4 sm:px-8
       pt-16 pb-20
    ">

      {/* header */}
      <div className="
        mb-12 mt-10
         text-center space-y-2
      ">
        <p className="
           text-3xl text-center
            text-zinc-400
        ">
          <ColourfulText text="Full Available Catalog" />
        </p>
      </div>

      {/* grid */}
      <div className="
        grid
         grid-cols-1
        sm:grid-cols-2
           lg:grid-cols-3
        xl:grid-cols-4
         gap-8
      ">
        {products.map(p => (
          <ResultCard key={p.product_id} product={p} />
        ))}
      </div>

      {/* bottom fade */}
      <div className="
         pointer-events-none
        mt-20
           h-24
        bg-linear-to-t from-white to-transparent
      " />
    </div>
  );
}
