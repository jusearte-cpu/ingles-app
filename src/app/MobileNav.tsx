"use client";

import { useState } from "react";
import Link from "next/link";

const PRIMARY = [
  { href: "/today", label: "Hoy" },
  { href: "/map", label: "Mapa" },
  { href: "/review", label: "Repaso" },
  { href: "/progress", label: "Progreso" },
];

const MORE = [
  { href: "/assessments", label: "Evaluaciones" },
  { href: "/portfolio", label: "Portafolio" },
  { href: "/diagnostic", label: "Diagnóstico" },
  { href: "/settings", label: "Configuración" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-10 bg-black/20 sm:hidden"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute inset-x-0 bottom-14 rounded-t-lg border-t border-black/10 bg-paper p-2 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {MORE.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded px-4 py-3 text-base active:bg-accentSoft"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-black/10 bg-paper py-2 text-sm sm:hidden">
        {PRIMARY.map((item) => (
          <Link key={item.href} href={item.href} className="rounded px-3 py-2 active:bg-accentSoft">
            {item.label}
          </Link>
        ))}
        <button onClick={() => setOpen((v) => !v)} className="rounded px-3 py-2 active:bg-accentSoft">
          Más
        </button>
      </nav>
    </>
  );
}
