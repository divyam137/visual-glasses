"use client";
import { AnimatePresence, motion } from "framer-motion";
import ResultCard from "./ResultCard";
import ResultsLoader from "./ResultsLoader";
import Image from "next/image";

export default function ResultsDeck({ results, loading }) {
  if (loading) return <ResultsLoader />;

  // empty state (before any search happens)
  if (!results?.length) {
    return (
      <div className="py-52 flex flex-col items-center gap-3 text-center">
          <Image
          src="/not-found.svg"
          alt="No Results"
          width={128}
          height={128}
          className="opacity-50"
         />
        <p className="text-sm text-center text-zinc-500">
          Upload an image to see matching lenses
        </p>
      </div>
    );
  }

    return (
    <motion.div
      layout
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.05 } },
      }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <AnimatePresence>
        {results.map((p, i) => (
          <motion.div
          key={p.product_id || i}
          layout
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 140, damping: 16 }}
          >
            <ResultCard product={p} />
          </motion.div>
        ))}
        </AnimatePresence>
        </motion.div>
  );
}
