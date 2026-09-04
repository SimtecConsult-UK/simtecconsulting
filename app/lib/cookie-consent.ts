/**
 * The visitor's cookie choice, and the one switch that decides whether we ask.
 *
 * The site currently loads no analytics, advertising or third-party embeds, so
 * there is nothing optional to consent to and no banner interrupts anyone. The
 * machinery is here so that the gate exists *before* something optional is
 * added rather than after: set `OPTIONAL_COOKIES_IN_USE` to true at that point
 * and the banner starts appearing for visitors who have not yet chosen.
 */

/** Flip to true when the site starts loading something optional. */
export const OPTIONAL_COOKIES_IN_USE = false;

/**
 * Bump when the categories change so that everyone is asked again — a choice
 * made about the old set says nothing about the new one.
 */
export const CONSENT_VERSION = 1;

/** "all" allows the optional categories; "essential" allows none of them. */
export type ConsentChoice = "all" | "essential";

export type StoredConsent = {
  choice: ConsentChoice;
  version: number;
  /** ISO timestamp, so we can show when the choice was made. */
  decidedAt: string;
};

const STORAGE_KEY = "simtec.cookie-consent";

/** Opening the settings from anywhere (the footer link) without a provider. */
export const OPEN_COOKIE_SETTINGS_EVENT = "simtec:open-cookie-settings";

/**
 * The stored choice, or null if the visitor has not chosen for this version.
 * Every access is guarded: Safari's private mode throws on storage access, and
 * a page that cannot read the choice should still render.
 */
export function readConsent(): StoredConsent | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredConsent>;
    if (parsed.version !== CONSENT_VERSION) return null;
    if (parsed.choice !== "all" && parsed.choice !== "essential") return null;
    return {
      choice: parsed.choice,
      version: CONSENT_VERSION,
      decidedAt: typeof parsed.decidedAt === "string" ? parsed.decidedAt : "",
    };
  } catch {
    return null;
  }
}

/** Records the choice and returns it, whether or not storage accepted it. */
export function writeConsent(choice: ConsentChoice): StoredConsent {
  const consent: StoredConsent = {
    choice,
    version: CONSENT_VERSION,
    decidedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  } catch {
    // Storage is unavailable (private mode, or the visitor blocks it). The
    // choice still holds for this page view, which is the safe direction.
  }
  return consent;
}

/**
 * Whether optional scripts may run. Anything added later — analytics, embeds,
 * pixels — should be behind this rather than checking storage on its own.
 */
export function optionalCookiesAllowed(): boolean {
  return readConsent()?.choice === "all";
}
