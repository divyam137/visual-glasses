"use client";
import { cn } from "@/lib/utils";

export default function GridBackground() {
  return (
    <>
      {/* Black grid on white */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          "bg-white",
          "[background-size:42px_42px]",
          "[background-image:linear-gradient(to_right,rgba(0,0,0,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.08)_1px,transparent_1px)]"
        )}
      />

      {/* Soft center fade */}
      <div className="pointer-events-none absolute inset-0 bg-white [mask-image:radial-gradient(circle_at_center,transparent_30%,white)]" />
    </>
  );
}
