"use client";

/**
 * "962 / 1200" beside a field's label. Grey normally, amber past 90%, red over
 * the limit — the handover's rule, so you can see a field filling up before it
 * stops you saving.
 */
export function CharCount({ value, limit }: { value: number; limit: number }) {
  const ratio = value / limit;
  const tone = ratio > 1 ? " cms-count--over" : ratio > 0.9 ? " cms-count--near" : "";

  return (
    <span className={`cms-count${tone}`} aria-live="polite">
      {value} / {limit}
    </span>
  );
}

/** Whether a field should be drawn as over its limit. A field with no limit never is. */
export function isOver(value: string, limit?: number): boolean {
  return limit !== undefined && value.length > limit;
}
