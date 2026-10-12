import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inglés — mi curso",
  description: "Curso personal de inglés, Pre-A1 a C1",
};

const NAV = [
  { href: "/today", label: "Hoy" },
  { href: "/map", label: "Mapa" },
  { href: "/review", label: "Repaso" },
  { href: "/progress", label: "Progreso" },
  { href: "/portfolio", label: "Portafolio" },
  { href: "/settings", label: "Config" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-paper text-ink">
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col pb-20 sm:pb-0">
          <header className="border-b border-black/10 px-4 py-3 sm:flex sm:items-center sm:justify-between">
            <span className="text-lg font-semibold text-accent">
              Inglés — Etapa 2 (local)
            </span>
            <nav className="mt-2 hidden gap-4 text-sm sm:mt-0 sm:flex">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded px-2 py-1 hover:bg-accentSoft"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>
          <main className="flex-1 px-4 py-6">{children}</main>
          <nav className="fixed inset-x-0 bottom-0 flex justify-around border-t border-black/10 bg-paper py-2 text-sm sm:hidden">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded px-3 py-2 active:bg-accentSoft"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </body>
    </html>
  );
}
