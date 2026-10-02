import { SEO_LIMITS, checkLimits, type FieldCheck } from "../../validation";
import type { PageSeoInput, SiteSettingsInput } from "./actions";

/**
 * The length checks for the site's own search settings.
 *
 * Kept out of `actions.ts` for the reason the newsletter's are: a `"use server"`
 * file may only export async functions, so a client importing `LIMITS` from
 * there would get a call handle instead of the numbers and every counter would
 * read "24 / ".
 */
export const LIMITS = {
  // The three a page and a post share.
  ...SEO_LIMITS,
  siteName: 60,
  orgLegalName: 120,
  orgDescription: 400,
} as const;

function pageFields(input: PageSeoInput): FieldCheck[] {
  return [
    { name: "meta title", value: input.metaTitle, limit: LIMITS.metaTitle },
    { name: "meta description", value: input.metaDescription, limit: LIMITS.metaDescription },
    { name: "key takeaway", value: input.keyTakeaway, limit: LIMITS.keyTakeaway },
  ];
}

/**
 * Everything that must be true before a page's settings can be written, which
 * is only that nothing is too long: every field falls back to the wording the
 * page already ships with, so leaving them all empty is a valid answer. The
 * editor greys Save out on this and shows the sentence, so it says what the
 * server would have said.
 */
export function pageTooLong(input: PageSeoInput): string | null {
  return checkLimits(pageFields(input));
}

function siteFields(input: SiteSettingsInput): FieldCheck[] {
  return [
    { name: "site name", value: input.siteName, limit: LIMITS.siteName, required: "Give the site a name — it is what search results and AI assistants call the company." },
    { name: "default title", value: input.defaultMetaTitle, limit: LIMITS.metaTitle },
    { name: "default description", value: input.defaultMetaDescription, limit: LIMITS.metaDescription },
    { name: "legal name", value: input.orgLegalName, limit: LIMITS.orgLegalName },
    { name: "company description", value: input.orgDescription, limit: LIMITS.orgDescription },
  ];
}

/**
 * Only the too-long problems, so the editor can grey Save out and say why.
 *
 * Deliberately not the profile-link check: that one runs on every keystroke, so
 * including it meant Save went dead and a red banner appeared the moment anyone
 * started typing an address and stayed there until they finished it. A
 * half-typed field is something you are in the middle of, not a mistake — the
 * same reason `checkLimits` leaves empty required fields to the server.
 */
export function siteTooLong(input: SiteSettingsInput): string | null {
  return checkLimits(siteFields(input));
}

/**
 * The profile links go into structured data as the company's official accounts,
 * so a half-typed address would be published as fact. Anything that is not a
 * web address is refused by name rather than silently dropped.
 */
function badProfileLink(input: SiteSettingsInput): string | null {
  const bad = input.orgSameAs
    .map((url) => url.trim())
    .filter((url) => url && !/^https?:\/\/\S+$/i.test(url));

  return bad.length > 0
    ? `"${bad[0]}" is not a web address. A profile link has to start with https:// — or leave the row empty to drop it.`
    : null;
}

export function validateSiteSettings(input: SiteSettingsInput): string | null {
  return checkLimits(siteFields(input), { includeRequired: true }) ?? badProfileLink(input);
}
