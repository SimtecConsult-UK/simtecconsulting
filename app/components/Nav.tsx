"use client";
import { useState } from "react";
import Image from "next/image";
import { useScrollEffect } from "../hooks/useScrollEffect";

const links = [
  { label: "Solutions", href: "#solutions" },
  { label: "Company", href: "#company" },
  { label: "Resources", href: "#resources" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  // Syncs on mount too, so a scroll-restored reload doesn't leave the nav transparent.
  useScrollEffect(() => setScrolled(window.scrollY > 10));

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        transition: "background 300ms ease, box-shadow 300ms ease, backdrop-filter 300ms ease",
        background: scrolled ? "rgba(11,10,12,0.77)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
        boxShadow: scrolled ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
      }}
    >
      <div className="mx-auto flex max-w-[var(--container-content)] items-center justify-between px-2.5 py-3 md:px-10">
        <Image
          src="/simtec-logo-white.png"
          alt="Simtec"
          width={2699}
          height={668}
          className="h-5 w-auto"
          priority
        />
        <ul className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-[13px] font-semibold text-white/70 transition-colors hover:text-white md:text-[14px]"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href="#contact"
          className="inline-flex items-center justify-center rounded-full bg-[var(--color-brand-blue)] px-4 py-1.5 text-[13px] font-semibold text-[#0c2421] transition-colors hover:bg-[#85f0e4] md:text-[14px]"
        >
          Book a Workshop
        </a>
      </div>
    </nav>
  );
}
