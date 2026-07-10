'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Drives a tab-switched video panel: tracks which tab is active and plays
 * its video while pausing the rest. `videoRefs.current[i]` must be wired up
 * to the i-th `<video>` via a ref callback.
 */
export function useTabVideoPlayer(initialActive = 0) {
  const [active, setActive] = useState(initialActive);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === active) v.play().catch(() => {});
      else v.pause();
    });
  }, [active]);

  return { active, setActive, videoRefs };
}
