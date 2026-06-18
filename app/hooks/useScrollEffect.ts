'use client';

import { useEffect, useRef } from 'react';

/**
 * Attaches a passive scroll listener that fires the handler inside
 * requestAnimationFrame, calls it once on mount, and cleans up on unmount.
 * The handler ref is kept current so callers never need useCallback.
 */
export function useScrollEffect(handler: () => void): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    let rafId = 0;

    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(() => { handlerRef.current(); rafId = 0; });
    };

    handlerRef.current(); // sync initial state on mount
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(rafId); };
  }, []);
}
