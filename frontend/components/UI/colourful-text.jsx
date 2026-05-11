"use client";
import { motion } from "motion/react";

export default function ColourfulText({ text }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .55, ease: "easeOut" }}
      className="
        bg-linear-to-r from-black via-zinc-800 to-indigo-600
        bg-clip-text text-transparent font-semibold tracking-tight
      "
    >
 { text }
    </motion.span>
  );
}
