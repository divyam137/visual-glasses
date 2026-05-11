"use client";

export default function ResultsLoader() {
  return (
      <div className="h-[60vh] w-full flex items-center justify-center">
       <div className="relative flex flex-col items-center gap-6">

        {/* glowing ring */}
        <div className="relative w-28 h-28">
          <div className="absolute inset-0 rounded-full border border-indigo-400/20" />
          <div className="absolute inset-0 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
          <div className="absolute inset-2 rounded-full bg-indigo-400/5 blur-lg" />
        </div>

        {/* text */}
        <p className="tracking-[0.3em] text-xs uppercase text-indigo-300 animate-pulse">
          Scanning Visual Space
        </p>

        <p className="text-[10px] text-zinc-500">
          AI analyzing shape, material & frame geometry
        </p>
        </div>
        </div>
  );
}
