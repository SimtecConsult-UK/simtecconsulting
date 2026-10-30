/** The right-pointing arrow that follows button and link labels across the site.
    Drawn in the surrounding text colour unless told otherwise. */
export function ArrowIcon({
  color = "currentColor",
  strokeWidth = 1.9,
}: {
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}
