"use client";

import { useId, useMemo, useState } from "react";
import { useScrollEffect } from "../../hooks/useScrollEffect";
import { ChevronIcon } from "../legal/icons";
import "./contents-nav.css";

export type ContentsItem = { id: string; label: string };

type Props = {
  items: ContentsItem[];
  /** The page's own look for the list and its links; the current link also
      gets `is-active`. */
  listClassName: string;
  linkClassName: string;
  /** The page's look for the label, shown above the list on desktop and in
      the toggle on small screens. */
  labelClassName: string;
  /** Prefix each label with its position, as the Terms clause index does. */
  numbered?: boolean;
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

export function ContentsNav({
  items,
  listClassName,
  linkClassName,
  labelClassName,
  numbered = false,
  label = "Contents",
}: Props) {
  const ids = useMemo(() => items.map((item) => item.id), [items]);
  const active = useActiveSection(ids);
  const [open, setOpen] = useState(false);

  const navId = useId();

  return (
    <>
      <button
        type="button"
        className="cn-toggle"
        aria-expanded={open}
        aria-controls={navId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={labelClassName}>{label}</span>
        <ChevronIcon />
      </button>

      <span className={`${labelClassName} cn-collapsed`}>{label}</span>

      <nav
        id={navId}
        className={open ? listClassName : `${listClassName} cn-collapsed`}
        aria-label={label}
      >
        {items.map((item, index) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={item.id === active ? `${linkClassName} is-active` : linkClassName}
            onClick={() => setOpen(false)}
          >
            <span>
              {numbered ? `${index + 1}. ${item.label}` : item.label}
            </span>
          </a>
        ))}
      </nav>
    </>
  );
}
