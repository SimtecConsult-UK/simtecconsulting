// The pure renderers behind the review sheet, the discovery brief and the
// CMS's submission page. Kept apart from ReviewShared.tsx because that file
// imports `useEffect` for its scroll-lock hooks, which makes the whole module
// client-only — these use no hooks, and the CMS renders them on the server.

import { Fragment } from "react";
import { type RepColumn, type RepRow, type ReviewValue, UNGROUPED_ROWS_HEADER, cellArray, cellText } from "./data";

function cellDisplay(column: RepColumn, row: RepRow): string {
  const value = row[column.key];
  const text = column.multiSelect ? cellArray(value).join(", ") : cellText(value);
  return text || "—";
}

// Rows in first-appearance order, split into the same buckets the wizard's own
// table shows for a `groupRowsBy` repeater (see DiscoveryWizard's RepTable).
// An ungrouped table is one headerless bucket, so the render below has a
// single path either way.
function groupRows(rows: RepRow[], groupBy?: string): { header: string | null; rows: RepRow[] }[] {
  if (!groupBy) return [{ header: null, rows }];
  const groups: { header: string; rows: RepRow[] }[] = [];
  rows.forEach((row) => {
    const header = cellText(row[groupBy]) || UNGROUPED_ROWS_HEADER;
    const existing = groups.find((g) => g.header === header);
    if (existing) existing.rows.push(row);
    else groups.push({ header, rows: [row] });
  });
  return groups;
}

export function ReviewTable({ columns, rows, groupBy }: { columns: RepColumn[]; rows: RepRow[]; groupBy?: string }) {
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
        {groupRows(rows, groupBy).map((group) => (
          <Fragment key={group.header ?? ""}>
            {group.header && (
              <tr className="dw-tgrp">
                <td colSpan={columns.length}>{group.header}</td>
              </tr>
            )}
            {group.rows.map((row, i) => (
              <tr key={cellText(row.__key) || `${group.header ?? ""}:${i}`}>
                {columns.map((c) => (
                  <td key={c.key}>{cellDisplay(c, row)}</td>
                ))}
              </tr>
            ))}
          </Fragment>
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
      return <ReviewTable columns={value.columns} rows={value.rows} groupBy={value.groupBy} />;
    case "skipped":
      return <span className="dw-tbc">NOT ANSWERED — TBC</span>;
  }
}
