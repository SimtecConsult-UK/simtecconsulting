"use client";

import { useMemo, useState } from "react";
import { useScrollEffect } from "../../hooks/useScrollEffect";
import { ChevronIcon } from "./icons";

export type ContentsItem = { id: string; label: string };

type Props = {
  items: ContentsItem[];
  /** "rail" is the Terms index rail (1a); "side" is the policy sidebar card (1c). */
  variant: "rail" | "side";
  /** Shown above the list on desktop, and inside the toggle on small screens. */
  label?: string;
};

/** Floor for the reading line, so it always clears where an anchor click lands
    a heading (globals.css sets scroll-padding-top to the nav height + 16px). */
const MIN_READING_LINE = 140;

/** Highlights whichever section the reader has scrolled to. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "");

  useScrollEffect(() => {
    // A section takes over once its heading has come up into the top third of
    // the screen. Anything tighter leaves the previous section highlighted
    // while the new heading is already well in view.
    const readingLine = Math.max(MIN_READING_LINE, window.innerHeight * 0.32);
    let current = ids[0] ?? "";
    for (const id of ids) {
      const el = document.getElementById(id);
      // sections here can be several screens tall, so it is their top edges,
      // not their extent, that says where the reader is
      if (el && el.getBoundingClientRect().top <= readingLine) current = id;
      else break;
    }
    setActive((previous) => (previous === current ? previous : current));
  });

  return active;
}

export function ContentsNav({ items, variant, label = "Contents" }: Props) {
  const ids = useMemo(() => items.map((item) => item.id), [items]);
  const active = useActiveSection(ids);
  const [open, setOpen] = useState(false);

  const linkClass = variant === "rail" ? "lg-t-rail-link" : "lg-p-side-link";
  const listClass = variant === "rail" ? "lg-t-rail-list" : "lg-p-side-list";
  const navId = `lg-contents-${variant}`;

  return (
    <>
      <button
        type="button"
        className="lg-toggle"
        aria-expanded={open}
        aria-controls={navId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="lg-eyebrow">{label}</span>
        <ChevronIcon />
      </button>

      <span className="lg-eyebrow lg-collapsed">{label}</span>

      <nav
        id={navId}
        className={open ? listClass : `${listClass} lg-collapsed`}
        aria-label={label}
      >
        {items.map((item, index) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={item.id === active ? `${linkClass} is-active` : linkClass}
            onClick={() => setOpen(false)}
          >
            <span>
              {variant === "rail" ? `${index + 1}. ${item.label}` : item.label}
            </span>
          </a>
        ))}
      </nav>
    </>
  );
}
