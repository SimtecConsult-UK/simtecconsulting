'use client';

import { useEffect, useRef } from 'react';

/**
 * The behaviour every full-screen overlay on the site needs: the page behind it
 * held still, focus moved in on open and handed back on close, Escape to
 * dismiss, and Tab kept inside the overlay.
 *
 * Returns refs to spread onto the overlay container and the element that should
 * take focus first (usually the close button), plus the keydown handler.
 */
export function useModalOverlay<T extends HTMLElement>(
  open: boolean,
  onClose: () => void,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialFocusRef = useRef<T>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);
  // Kept current so callers can pass a fresh closure without useCallback.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  // Where closing scrolls back to. Recomputed fresh from window.scrollY each time
  // the overlay opens; a caller can override it (e.g. to land on the hero
  // instead of wherever the page happened to be scrolled to) before closing.
  const restoreScrollYRef = useRef(0);

  // Scroll lock that works on iOS Safari: position:fixed + saved scroll offset.
  // Also saves/restores the previous overflow value so other overlays aren't clobbered.
  useEffect(() => {
    if (!open) return;
    restoreScrollYRef.current = window.scrollY;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${restoreScrollYRef.current}px`;
    document.body.style.width = '100%';
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, restoreScrollYRef.current);
    };
  }, [open]);

  // Focus management: move focus in on open, restore it on close.
  useEffect(() => {
    if (open) {
      prevFocusRef.current = document.activeElement as HTMLElement;
      initialFocusRef.current?.focus();
    } else {
      prevFocusRef.current?.focus();
    }
  }, [open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCloseRef.current();
      return;
    }
    if (e.key !== 'Tab') return;
    const focusable = containerRef.current?.querySelectorAll<HTMLElement>(
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

  return { containerRef, initialFocusRef, onKeyDown, restoreScrollYRef };
}
