/**
 * "Notes from the floor" → "notes-from-the-floor".
 *
 * Shared so the editor can show the web address as you type and the server can
 * derive the same one when it saves — two implementations would eventually
 * disagree and create a post at an address the editor never saw.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    // Strip accents so "Café" becomes "cafe" rather than "caf".
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
