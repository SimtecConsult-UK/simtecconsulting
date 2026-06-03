"use client";
import { useState, useEffect } from "react";
import { Logo } from "./Logo";

const links = [
  { label: "Solutions", href: "#solutions" },
  { label: "Company", href: "#company" },
  { label: "Resources", href: "#resources" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      <div className="mx-auto flex max-w-[var(--container-content)] items-center justify-between px-4 py-5 md:px-16">
        <Logo white />
        <ul className="hidden items-center gap-10 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-[15px] font-semibold text-white/70 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href="#contact"
          className="inline-flex items-center justify-center rounded-full bg-[var(--color-brand-blue)] px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#5d7dfa]"
        >
          Book a Workshop
        </a>
      </div>
    </nav>
  );
}
