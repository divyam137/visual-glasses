"use client";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  // keeps track of whether the mobile menu is open or not
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // TODO: might add more pages here later (About, Contact, etc.)
  const nav = [
    { name: "Scanner", href: "/" },
    { name: "Catalog", href: "/catalog" },
  ];
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[94%] sm:w-[90%] md:w-[78%] lg:w-[70%] xl:w-[60%]">
     <header className=" rounded-2xl backdrop-blur-xl bg-white/80 dark:bg-black/60 border border-black/10 dark:border-white/10 shadow-[0_12px_35px_rgba(0,0,0,0.15)] ">

    <div className="flex items-center justify-between px-6 py-3">

          {/* logo + small tagline */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-xl bg-indigo-50 text-xs font-semibold tracking-wide shadow-sm group-hover:bg-indigo-100 transition">
              LensIQ
            </span>
            {/* TODO: Better tagline soon */}
            <span className="hidden sm:inline text-xs text-zinc-600 font-medium leading-tight">
              Visual Similarity Search for Eyewear
            </span>
          </Link>
          {/* desktop links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            {nav.map((item) => (
              <Link
              key={item.name}
              href={item.href}
              className={`px-2 rounded-2xl border-2 transition
              ${pathname === item.href
              ? "text-indigo-800"
              : "hover:text-indigo-800 hover:shadow-xl"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          {/* hamburger button for mobile */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden opacity-70 hover:opacity-100 transition"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {open && (
          <div className="
            md:hidden rounded-b-2xl border-t border-black/10 dark:border-white/10
            bg-white/90 dark:bg-black/80 backdrop-blur-xl
            px-6 py-4 space-y-3
          ">
            {nav.map((item) => (
              <Link
              key={item.name}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`block font-medium transition
              ${pathname === item.href
              ? "text-indigo-600"
              : "hover:text-indigo-600"
               }`}
              >
             {item.name}
              </Link>
            ))}
          </div>
        )}
      </header>
    </div>
  );
}
