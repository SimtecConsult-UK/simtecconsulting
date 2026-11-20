"use client";

import { printBrief } from "../../../discovery/printBrief";

/**
 * "Download PDF" for a submission — the same print-to-PDF the wizard's own
 * brief uses (see printBrief). The page carries a print-only copy of the
 * Discovery Brief (see SubmissionView), so what is saved is the document the
 * visitor previewed. A client island so SubmissionView can stay on the server.
 */
export function DownloadBrief({ fileName }: { fileName: string }) {
  return (
    <button
      type="button"
      className="cms-btn cms-btn--secondary"
      title="Opens your browser's print window. Choose “Save as PDF” as the destination."
      onClick={() => printBrief(fileName)}
    >
      ⬇ Download PDF
    </button>
  );
}
