// "Download PDF" for the Discovery Brief, shared by the wizard's preview and
// the CMS's submission page: both save through the browser's print-to-PDF.
// Browsers name the saved file after the page title, so it is swapped for the
// brief's own name while the print dialog is open and put back afterwards.

/** Long enough for any real company and project, short enough for every OS. */
const MAX_FILE_NAME = 120;

/** "Discovery Brief - Igne - Lab Management System" — the saved PDF's name. */
export function briefFileName(company?: string | null, projectName?: string | null): string {
  const clean = (part?: string | null) =>
    (part ?? "")
      // Control characters, and the ones operating systems refuse in a file name.
      .replace(/[\u0000-\u001f\u007f\\/:*?"<>|]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  return ["Discovery Brief", clean(company), clean(projectName)]
    .filter(Boolean)
    .join(" - ")
    .slice(0, MAX_FILE_NAME)
    .trim();
}

/**
 * The page's own title while a brief print is in progress, or null when none
 * is. Kept here rather than per click so a second click before the first
 * print finishes (some browsers do not block on print) cannot record the
 * brief's name as the "original" and leave it on the tab.
 */
let originalTitle: string | null = null;

function restoreTitle() {
  if (originalTitle !== null) document.title = originalTitle;
  originalTitle = null;
}

export function printBrief(fileName: string) {
  if (originalTitle === null) {
    originalTitle = document.title;
    window.addEventListener("afterprint", restoreTitle, { once: true });
  }
  document.title = fileName;
  window.print();
}
