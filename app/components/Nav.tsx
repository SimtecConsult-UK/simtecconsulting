"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useScrollEffect } from "../hooks/useScrollEffect";
import { useModalOverlay } from "../hooks/useModalOverlay";
import { ROUTES, SECTION_IDS } from "../lib/sections";

const links = [
  { label: "Solutions", href: `#${SECTION_IDS.solutions}` },
  { label: "Our Team", href: `#${SECTION_IDS.team}` },
  { label: "Case Studies", href: `#${SECTION_IDS.productDemo}` },
  { label: "Testimonials", href: `#${SECTION_IDS.testimonials}` },
];

/** The white wordmark, linking home. Both nav surfaces render the same asset
    and accessible name; only the size hints and the menu-closing click differ. */
function NavLogo({
  className,
  sizes,
  priority = false,
  prefetch,
  onClick,
}: {
  className: string;
  sizes: string;
  priority?: boolean;
  prefetch?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={ROUTES.home}
      aria-label="Simtec home"
      className="inline-flex"
      prefetch={prefetch}
      onClick={onClick}
    >
      <Image
        src="/simtec-logo-white.png"
        alt="Simtec"
        width={2699}
        height={668}
        className={className}
        sizes={sizes}
        priority={priority}
      />
    </Link>
  );
}

type NavProps = {
  /** Force the scrolled (opaque) treatment. Needed on the light legal pages,
      where the transparent bar would leave the white logo invisible. */
  solid?: boolean;
};

export function Nav({ solid = false }: NavProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { containerRef, initialFocusRef, onKeyDown } =
    useModalOverlay<HTMLButtonElement>(menuOpen, () => setMenuOpen(false));

  useScrollEffect(() => setScrolled(window.scrollY > 12));

  // The section links are same-page anchors on the homepage and cross-page
  // links everywhere else. They stay plain <a> on purpose: next/link disables
  // smooth scrolling for hash targets, which would turn the glide down to a
  // section into an abrupt jump.
  const onHome = pathname === ROUTES.home;
  const sectionHref = (href: string) => (onHome ? href : `/${href}`);
  // On the homepage the logo points at the page we are already on, so skip the
  // viewport prefetch that would re-download the home payload for nothing.
  const logoPrefetch = onHome ? false : undefined;
  const opaque = solid || scrolled;

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          transition: "background 300ms ease, border-color 300ms ease, backdrop-filter 300ms ease",
          background: solid ? "#1b1b1d" : opaque ? "rgba(11,10,12,0.86)" : "transparent",
          backdropFilter: !solid && opaque ? "blur(14px)" : "none",
          WebkitBackdropFilter: !solid && opaque ? "blur(14px)" : "none",
          borderBottom: opaque ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
        }}
      >
        <div className="mx-auto flex max-w-[var(--container-content)] items-center justify-between px-[22px] py-4 min-[900px]:px-10 min-[900px]:py-[22px] xl:px-16">
          <NavLogo
            className="h-[22px] w-auto min-[521px]:h-[26px]"
            sizes="(min-width: 521px) 105px, 89px"
            priority
            prefetch={logoPrefetch}
          />

          <ul className="hidden min-[900px]:flex items-center gap-[38px]">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={sectionHref(link.href)}
                  className="text-[15px] font-semibold text-white/70 transition-colors duration-150 hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3.5">
            <Link
              href={ROUTES.discovery}
              className="hidden min-[521px]:inline-flex items-center justify-center gap-2 rounded-full border border-[#2dd4bf] px-6 py-[11px] text-[14px] font-semibold text-[#2dd4bf] transition-colors duration-150 hover:bg-[#2dd4bf] hover:text-[#06241f]"
            >
              Book a Workshop
            </Link>

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
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="fixed inset-0 z-[100] flex flex-col px-[22px] pb-10 pt-[22px]"
          style={{
            background: "rgba(9,8,11,0.98)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
          onKeyDown={onKeyDown}
        >
          <div className="flex items-center justify-between">
            <NavLogo
              className="h-[22px] w-auto"
              sizes="89px"
              prefetch={logoPrefetch}
              onClick={() => setMenuOpen(false)}
            />
            <button
              ref={initialFocusRef}
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
                  href={sectionHref(link.href)}
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

          <Link
            href={ROUTES.discovery}
            onClick={() => setMenuOpen(false)}
            className="mt-auto flex items-center justify-center gap-2 rounded-[14px] border border-[#2dd4bf] py-4 text-[16px] font-semibold text-[#2dd4bf]"
          >
            Book a Workshop
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </Link>
        </div>
      )}
    </>
  );
}
