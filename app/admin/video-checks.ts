/**
 * The screen-recording requirements from the handover.
 *
 * Nothing here converts a file — it only checks one and explains what is wrong,
 * which is the trade-off that was chosen over adding a transcoding service. The
 * numbers are what the homepage was designed and tested against: a recording
 * outside them either looks wrong in the browser mock-up or is too heavy for
 * the page.
 *
 * One set of numbers for both recordings on the homepage — the hero's and the
 * case studies' — because both sit in the same mock-up at the same size. Moved
 * up here out of the case-studies folder when the hero became editable, so the
 * two cannot drift apart.
 */

export const VIDEO_SPEC = {
  types: ["video/mp4", "video/webm"],
  minWidth: 1600,
  maxWidth: 2560,
  minDuration: 10,
  maxDuration: 45,
  maxBytes: 15 * 1024 * 1024,
  ratio: 16 / 9,
  /** 16:9 to within a rounding error, since encoders are not exact. */
  ratioTolerance: 0.02,
} as const;

/** What a file picker accepts, so the dialogue offers what `checkVideo` allows. */
export const VIDEO_ACCEPT = VIDEO_SPEC.types.join(",");

/**
 * The requirements as the one line shown under a drop zone.
 *
 * Built from the numbers above rather than typed out beside them: it was the
 * same sentence in both editors, and a sentence that restates a constant is
 * the half that drifts once the constant moves.
 */
export const VIDEO_HINT = [
  "MP4 or WebM",
  "16:9",
  `${VIDEO_SPEC.minDuration}–${VIDEO_SPEC.maxDuration}s`,
  `under ${VIDEO_SPEC.maxBytes / 1024 / 1024} MB`,
].join(" · ");

export type Check = { label: string; ok: boolean; detail?: string };

export function checkVideo(
  file: File,
  info: { width: number; height: number; duration: number }
): Check[] {
  const ratio = info.height > 0 ? info.width / info.height : 0;
  const megabytes = (file.size / 1024 / 1024).toFixed(1);

  return [
    {
      label: "MP4 or WebM",
      ok: VIDEO_SPEC.types.includes(file.type as (typeof VIDEO_SPEC.types)[number]),
      detail: file.type || "unknown type",
    },
    {
      label: "16:9",
      ok: Math.abs(ratio - VIDEO_SPEC.ratio) <= VIDEO_SPEC.ratioTolerance,
      detail: `${info.width}×${info.height}`,
    },
    {
      label: `${VIDEO_SPEC.minWidth}px wide or more`,
      ok: info.width >= VIDEO_SPEC.minWidth && info.width <= VIDEO_SPEC.maxWidth,
      detail: `${info.width}px`,
    },
    {
      label: `${VIDEO_SPEC.minDuration}–${VIDEO_SPEC.maxDuration} seconds`,
      ok:
        info.duration >= VIDEO_SPEC.minDuration &&
        info.duration <= VIDEO_SPEC.maxDuration,
      detail: `${info.duration.toFixed(0)}s`,
    },
    {
      label: "15 MB or under",
      ok: file.size <= VIDEO_SPEC.maxBytes,
      detail: `${megabytes} MB`,
    },
  ];
}

/** One sentence naming everything that failed, for the editor to show. */
export function describeFailures(checks: Check[]): string | null {
  const failed = checks.filter((check) => !check.ok);
  if (failed.length === 0) return null;

  const parts = failed.map((check) => `${check.label} (yours: ${check.detail})`);
  return `This recording does not meet ${failed.length === 1 ? "one requirement" : `${failed.length} requirements`}: ${parts.join("; ")}. Re-export it and try again.`;
}
