"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useScrollEffect } from "../hooks/useScrollEffect";
import { ROUTES, SECTION_IDS } from "../lib/sections";

const links = [
  { label: "Solutions", href: `#${SECTION_IDS.solutions}` },
  { label: "Our Team", href: `#${SECTION_IDS.team}` },
  { label: "Case Studies", href: `#${SECTION_IDS.productDemo}` },
  { label: "Testimonials", href: `#${SECTION_IDS.testimonials}` },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);

  useScrollEffect(() => setScrolled(window.scrollY > 12));

  // Scroll lock that works on iOS Safari: position:fixed + saved scroll offset.
  // Also saves/restores the previous overflow value so other overlays aren't clobbered.
  useEffect(() => {
    if (!menuOpen) return;
    const scrollY = window.scrollY;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, [menuOpen]);

  // Focus management: move focus in on open, restore it on close.
  useEffect(() => {
    if (menuOpen) {
      prevFocusRef.current = document.activeElement as HTMLElement;
      closeButtonRef.current?.focus();
    } else {
      prevFocusRef.current?.focus();
    }
  }, [menuOpen]);

  const handleOverlayKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setMenuOpen(false);
      return;
    }
    if (e.key !== "Tab") return;
    const focusable = overlayRef.current?.querySelectorAll<HTMLElement>(
      'button, a[href], [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable || focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          transition: "background 300ms ease, border-color 300ms ease, backdrop-filter 300ms ease",
          background: scrolled ? "rgba(11,10,12,0.86)" : "transparent",
          backdropFilter: scrolled ? "blur(14px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
        }}
      >
        <div className="mx-auto flex max-w-[var(--container-content)] items-center justify-between px-[22px] py-4 min-[900px]:px-10 min-[900px]:py-[22px] xl:px-16">
          <Image
            src="/simtec-logo-white.png"
            alt="Simtec"
            width={2699}
            height={668}
            className="h-[22px] w-auto min-[521px]:h-[26px]"
            sizes="(min-width: 521px) 105px, 89px"
            priority
          />

          <ul className="hidden min-[900px]:flex items-center gap-[38px]">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-[15px] font-semibold text-white/70 transition-colors duration-150 hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3.5">
            <a
              href={ROUTES.discovery}
              className="hidden min-[521px]:inline-flex items-center justify-center gap-2 rounded-full border border-[#2dd4bf] px-6 py-[11px] text-[14px] font-semibold text-[#2dd4bf] transition-colors duration-150 hover:bg-[#2dd4bf] hover:text-[#06241f]"
            >
              Book a Workshop
            </a>

            <button
              type="button"
              className="inline-flex min-[900px]:hidden items-center justify-center p-1.5 text-white"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div
          id="mobile-menu"
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="fixed inset-0 z-[100] flex flex-col px-[22px] pb-10 pt-[22px]"
          style={{
            background: "rgba(9,8,11,0.98)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
          onKeyDown={handleOverlayKeyDown}
        >
          <div className="flex items-center justify-between">
            <Image
              src="/simtec-logo-white.png"
              alt="Simtec"
              width={2699}
              height={668}
              className="h-[22px] w-auto"
              sizes="89px"
            />
            <button
              ref={closeButtonRef}
              type="button"
              className="inline-flex p-1.5 text-white"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <ul className="mt-10 flex flex-col">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 py-[17px] text-[24px] font-bold text-white"
                  style={{
                    fontFamily: "var(--font-league-spartan)",
                    letterSpacing: "-0.005em",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <a
            href={ROUTES.discovery}
            onClick={() => setMenuOpen(false)}
            className="mt-auto flex items-center justify-center gap-2 rounded-[14px] border border-[#2dd4bf] py-4 text-[16px] font-semibold text-[#2dd4bf]"
          >
            Book a Workshop
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </a>
        </div>
      )}
    </>
  );
}
