/**
 * The CMS's own icons. A plain module rather than part of `EditorUI.tsx`, which
 * is a Client Component — these are static markup and belong on the server,
 * where every list page that draws them already renders.
 */

/** The chevron at the end of every row in a CMS list. */
export function Chevron() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="#9aa5a4"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 3.5L10.5 8 6 12.5" />
    </svg>
  );
}
