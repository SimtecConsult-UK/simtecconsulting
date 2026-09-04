'use client';

import type { MouseEvent } from 'react';
import { usePathname } from 'next/navigation';
import { ROUTES } from '../lib/sections';

/**
 * Clicking the logo when the visitor is already on the homepage would
 * otherwise do nothing — navigating to the page you're on is a no-op for the
 * router. Scrolling back up to the hero instead is the "go home" outcome a
 * visitor actually expects, from the middle or bottom of the page.
 */
export function useHomeLinkClick() {
  const pathname = usePathname();
  const onHome = pathname === ROUTES.home;

  const scrollToHero = (event: MouseEvent) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return { onHome, scrollToHero };
}
