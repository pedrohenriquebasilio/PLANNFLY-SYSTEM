"use client";

import Link from "next/link";

const navLinks = [
  { label: "Início", href: "#inicio" },
  { label: "Problema", href: "#problema" },
  { label: "Solução", href: "#solucao" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Benefícios", href: "#beneficios" },
  { label: "Diferencial", href: "#diferencial" },
  { label: "Contato", href: "#contato" },
];

export function Navbar() {
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 backdrop-blur-md bg-white/10 border border-white/20 rounded-full px-2 py-2 flex items-center gap-1">
      <div className="hidden md:flex items-center gap-1">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="px-4 py-2 rounded-full text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-white/10 transition-all"
          >
            {link.label}
          </a>
        ))}
      </div>

      <Link
        href="/login"
        className="bg-foreground text-background px-5 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Entrar
      </Link>
    </nav>
  );
}
