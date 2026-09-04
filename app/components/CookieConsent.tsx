"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useModalOverlay } from "../hooks/useModalOverlay";
import {
  OPEN_COOKIE_SETTINGS_EVENT,
  OPTIONAL_COOKIES_IN_USE,
  readConsent,
  writeConsent,
  type ConsentChoice,
  type StoredConsent,
} from "../lib/cookie-consent";

const PRIMARY = "#2dd4bf";

/** The policy that explains what we do with personal data. */
const DATA_POLICY = "/policies/data-protection-and-retention-policy";

type ChoiceButtonsProps = {
  onChoose: (choice: ConsentChoice) => void;
  /** The dialog stacks its buttons on narrow screens; the bar never does. */
  className?: string;
};

function ChoiceButtons({ onChoose, className = "" }: ChoiceButtonsProps) {
  return (
    <div className={`flex flex-col gap-2.5 sm:flex-row ${className}`}>
      <button
        type="button"
        onClick={() => onChoose("all")}
        className="inline-flex items-center justify-center rounded-full px-6 py-[11px] text-[14px] font-semibold text-[#06241f] transition-opacity duration-150 hover:opacity-90"
        style={{ background: PRIMARY }}
      >
        Accept all
      </button>
      <button
        type="button"
        onClick={() => onChoose("essential")}
        className="inline-flex items-center justify-center rounded-full border border-white/25 px-6 py-[11px] text-[14px] font-semibold text-white transition-colors duration-150 hover:border-white/50"
      >
        Essentials only
      </button>
    </div>
  );
}

/** Plain-English account of what is stored, shown in the settings dialog. */
function WhatWeStore() {
  return (
    <dl className="mt-6 space-y-5 text-[14px] leading-relaxed">
      <div>
        <dt className="font-semibold text-white">
          Essential{" "}
          <span className="font-normal text-white/45">— always on</span>
        </dt>
        <dd className="mt-1 text-white/60">
          Keeps the site working: it remembers your answers if you start the
          discovery workshop form, and it remembers the choice you make here.
          These cannot be switched off without breaking those features.
        </dd>
      </div>
      <div>
        <dt className="font-semibold text-white">Analytics and marketing</dt>
        <dd className="mt-1 text-white/60">
          {OPTIONAL_COOKIES_IN_USE ? (
            <>
              Helps us understand which pages are useful and how people find us.
              Nothing here is needed for the site to work.
            </>
          ) : (
            <>
              We do not use any at the moment — this site loads no analytics,
              advertising or third-party tracking. Your choice is recorded now
              so that it already applies if that ever changes.
            </>
          )}
        </dd>
      </div>
    </dl>
  );
}

export function CookieConsent() {
  // undefined until the browser has been read, so the server and the first
  // client render agree and nothing flashes into view during hydration.
  const [consent, setConsent] = useState<StoredConsent | null | undefined>(
    undefined,
  );
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => setConsent(readConsent()), []);

  // The footer link lives in a server component, so it asks by event.
  useEffect(() => {
    const open = () => setSettingsOpen(true);
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, open);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, open);
  }, []);

  const { containerRef, initialFocusRef, onKeyDown } =
    useModalOverlay<HTMLButtonElement>(settingsOpen, () =>
      setSettingsOpen(false),
    );

  const choose = (choice: ConsentChoice) => {
    setConsent(writeConsent(choice));
    setSettingsOpen(false);
  };

  // Only interrupt people once there is something optional to decline.
  const showBar =
    OPTIONAL_COOKIES_IN_USE && consent === null && !settingsOpen;

  return (
    <>
      {showBar && (
        <div
          role="region"
          aria-label="Cookie choices"
          className="fixed inset-x-0 bottom-0 z-[150] px-[22px] pb-[22px]"
        >
          <div
            className="mx-auto flex max-w-[var(--container-content)] flex-col gap-4 rounded-2xl border border-white/10 p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-6"
            style={{
              background: "rgba(20,19,23,0.97)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              boxShadow: "0 18px 48px rgba(0,0,0,0.45)",
            }}
          >
            <p className="text-[14px] leading-relaxed text-white/70">
              <span className="font-semibold text-white">We use cookies.</span>{" "}
              Some keep the site working. Others would help us understand how it
              is used — those are yours to decline.{" "}
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="font-semibold text-white underline underline-offset-4 hover:text-white/80"
              >
                See what we store
              </button>
            </p>
            <ChoiceButtons onChoose={choose} className="shrink-0" />
          </div>
        </div>
      )}

      {settingsOpen && (
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-settings-title"
          onKeyDown={onKeyDown}
          className="fixed inset-0 z-[200] flex items-end justify-center p-0 sm:items-center sm:p-6"
        >
          <div
            aria-hidden="true"
            onClick={() => setSettingsOpen(false)}
            className="absolute inset-0"
            style={{ background: "rgba(9,8,11,0.75)" }}
          />

          <div
            className="relative max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-t-2xl border border-white/10 p-6 text-white sm:rounded-2xl sm:p-8"
            style={{
              background: "#141317",
              boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
            }}
          >
            <div className="flex items-start justify-between gap-6">
              <h2
                id="cookie-settings-title"
                className="text-[22px] font-bold"
                style={{
                  fontFamily: "var(--font-league-spartan)",
                  letterSpacing: "-0.005em",
                }}
              >
                Cookie settings
              </h2>
              <button
                ref={initialFocusRef}
                type="button"
                onClick={() => setSettingsOpen(false)}
                aria-label="Close"
                className="-mr-1.5 -mt-1.5 inline-flex shrink-0 p-1.5 text-white/60 transition-colors duration-150 hover:text-white"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <WhatWeStore />

            <div className="mt-7 border-t border-white/10 pt-6">
              <ChoiceButtons onChoose={choose} />
              <p className="mt-4 text-[13px] text-white/45">
                {consent
                  ? `You currently allow: ${
                      consent.choice === "all"
                        ? "essential, analytics and marketing"
                        : "essential only"
                    }. You can change this at any time from the footer.`
                  : "You have not made a choice yet. Until you do, only essential storage is used."}
              </p>
              <Link
                href={DATA_POLICY}
                prefetch={false}
                onClick={() => setSettingsOpen(false)}
                className="mt-4 inline-block text-[13px] font-semibold text-white/70 underline underline-offset-4 hover:text-white"
              >
                Read our data protection policy
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
