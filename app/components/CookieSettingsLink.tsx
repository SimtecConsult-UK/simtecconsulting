"use client";

import { OPEN_COOKIE_SETTINGS_EVENT } from "../lib/cookie-consent";

/**
 * The footer's way into the cookie settings. It is a button rather than a link
 * because it opens a dialog rather than going anywhere, styled to sit with the
 * legal links beside it.
 */
export function CookieSettingsLink({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() =>
        window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT))
      }
      className={`text-left ${className}`}
    >
      Cookie Settings
    </button>
  );
}
