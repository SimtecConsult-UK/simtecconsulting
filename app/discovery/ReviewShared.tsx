// Shared bits between the review sheet (ReviewSheet.tsx, "1a") and the
// discovery brief (DiscoveryBrief.tsx, "1c") — both render the exact same
// `ReviewValue` (see data.ts) the exact same way, just inside different
// surrounding layout (a `.dw-qrow` grid vs. a `.dw-dl` definition list).

import { useEffect } from "react";
import type { SubmitStatus } from "./submission";

export { ReviewTable, ReviewValueView } from "./ReviewValue";

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

/**
 * The submit button, shared by the review sheet and the brief.
 *
 * Both overlays send the same wizard, so both need the same three states and
 * the same failure message. Written once because the two copies had already
 * drifted: one showed the error as text, the other hid it in a `title`
 * attribute on a disabled button, where a touch user can never see it.
 */
export function SubmitButton({
  submit,
  consent,
  onSubmit,
  className,
  restingLabel,
  sentLabel,
}: {
  submit: SubmitStatus;
  consent: boolean;
  onSubmit: () => void;
  className: string;
  restingLabel: string;
  sentLabel: string;
}) {
  const failure = submit.state.kind === "failed" ? submit.state.message : null;

  if (submit.state.kind === "sent") {
    return <span className={`${className} dw-tbtn-static`}>{sentLabel}</span>;
  }

  return (
    <>
      {failure && (
        <span className="dw-senderr" role="alert">
          {failure}
        </span>
      )}
      <button
        className={`${className}${consent && !submit.sending ? "" : " dw-dis"}`}
        disabled={!consent || submit.sending}
        onClick={onSubmit}
        title={consent ? undefined : "Tick the consent box on the review screen"}
      >
        {submit.sending
          ? "Sending…"
          : failure
            ? "Try again →"
            : consent
              ? restingLabel
              : "Tick consent to submit"}
      </button>
    </>
  );
}
