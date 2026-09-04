"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { ROUTES } from "../lib/sections";
import { useHomeLinkClick } from "../hooks/useHomeLinkClick";

/**
 * The footer's own client boundary, so the "scroll to hero instead of
 * navigating" behaviour (see useHomeLinkClick) can run here even though the
 * footer around it is a plain server component.
 */
export function FooterLogoLink() {
  const { onHome, scrollToHero } = useHomeLinkClick();
  return (
    <Link
      href={ROUTES.home}
      aria-label="Simtec home"
      className="inline-flex"
      onClick={onHome ? scrollToHero : undefined}
    >
      <Logo />
    </Link>
  );
}
