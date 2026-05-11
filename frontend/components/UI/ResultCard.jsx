"use client";
import { useState } from "react";
import { Lens } from "../ui/lens";
import { motion } from "framer-motion";

export default function ResultCard({ product }) {
  const [hovering, setHovering] = useState(false);

  const ping = () => {
    // let the backend know someone clicked this
    fetch(`http://localhost:8000/click/${product.product_id}`, {
      method: "POST",
    }).catch(() => {});
  };
return (
    <a
      href={product.buy_url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={ping}
      className="block"
    >
   <motion.div
    whileHover={{ scale: 1.035, y: -3 }}
     transition={{ type: "spring", stiffness: 128, damping: 17 }}
    className="
     relative rounded-3xl overflow-hidden bg-zinc-200/70 backdrop-blur-xl p-6 shadow-[0_18px_45px_-12px_rgba(0,0,0,0.38)] w-full h-75"
      >
        <div className="relative z-10 space-y-3">
          <Lens hovering={hovering} setHovering={setHovering}>
            <img
           src={product.image_url.toLowerCase()}
           alt={product.style}
          className="rounded-2xl h-40 w-full object-contain bg-white p-2"
          />

          </Lens>

          <motion.div animate={{ filter: hovering ? "blur(1px)" : "blur(0px)" }}>
            <div className="flex items-start justify-between">
              <p className="text-zinc-900 font-semibold text-sm leading-tight">
              {product.name || `${product.style} Frame`}
           </p>
            <span className="text-indigo-700 font-bold text-sm">
            ₹{product.price}
            </span>
            </div>

            <p className="mt-1 text-[10px] uppercase tracking-widest text-zinc-500">
              Lenskart
            </p>

            <p className="text-xs text-zinc-600 mt-2">{product.material}</p>
          </motion.div>
        </div>
      </motion.div>
    </a>
  );
}
