// Shared bits between the review sheet (ReviewSheet.tsx, "1a") and the
// discovery brief (DiscoveryBrief.tsx, "1c") — both render the exact same
// `ReviewValue` (see data.ts) the exact same way, just inside different
// surrounding layout (a `.dw-qrow` grid vs. a `.dw-dl` definition list).

import { Fragment, useEffect } from "react";
import { type RepColumn, type RepRow, type ReviewValue, cellArray, cellText } from "./data";

// Both overlays are full-screen and modal over the wizard behind them, so
// each locks body scroll for as long as it's mounted — mount/unmount already
// tracks "opened"/"closed" (see DiscoveryWizard.tsx's `overlay` state), so
// there's nothing else to key this effect off of.
export function useBodyScrollLock() {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);
}

// Each overlay owns its own Escape-to-close, rather than the wizard's global
// keydown handler needing to know both overlays exist and deciding which one
// to close — the wizard's listener only has to stay out of the way while an
// overlay is open (see its `overlay !== "none"` early return).
export function useEscapeKey(onEscape: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onEscape();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onEscape]);
}

function cellDisplay(column: RepColumn, row: RepRow): string {
  const value = row[column.key];
  const text = column.multiSelect ? cellArray(value).join(", ") : cellText(value);
  return text || "—";
}

export function ReviewTable({ columns, rows }: { columns: RepColumn[]; rows: RepRow[] }) {
  return (
    <table className="dw-tbl">
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.key}>{c.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={cellText(row.__key) || i}>
            {columns.map((c) => (
              <td key={c.key}>{cellDisplay(c, row)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ReviewValueView({ value }: { value: ReviewValue }) {
  switch (value.kind) {
    case "text":
      return <span className="dw-rv-text">{value.text}</span>;
    case "chips":
      return (
        <Fragment>
          {value.chips.map((chip) => (
            <span className="dw-rv-chip" key={chip}>
              {chip}
            </span>
          ))}
        </Fragment>
      );
    case "table":
      return <ReviewTable columns={value.columns} rows={value.rows} />;
    case "skipped":
      return <span className="dw-tbc">NOT ANSWERED — TBC</span>;
  }
}
