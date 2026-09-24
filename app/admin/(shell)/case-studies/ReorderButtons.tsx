"use client";

import { useTransition } from "react";
import { moveCaseStudy } from "./actions";

/** The up/down arrows that set homepage order. */
export function ReorderButtons({
  id,
  isFirst,
  isLast,
}: {
  id: string;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [pending, startTransition] = useTransition();

  // Awaited inside the transition, so `pending` stays true until the move has
  // actually happened and the list has caught up. Firing and forgetting left
  // both arrows live, and a second click raced the first.
  const move = (direction: "up" | "down") =>
    startTransition(async () => {
      await moveCaseStudy(id, direction);
    });

  return (
    <span className="cms-reorder">
      <button type="button" aria-label="Move up" disabled={isFirst || pending} onClick={() => move("up")}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 12V4M4 8l4-4 4 4" />
        </svg>
      </button>
      <button type="button" aria-label="Move down" disabled={isLast || pending} onClick={() => move("down")}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 4v8M4 8l4 4 4-4" />
        </svg>
      </button>
    </span>
  );
}
