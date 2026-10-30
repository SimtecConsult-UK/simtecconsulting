import { notFound } from "next/navigation";

/**
 * Catches any /admin address that matches no page, so it gets the CMS's own
 * not-found (inside the shell, behind the sign-in) instead of the public 404,
 * which is all Next offers an unmatched URL by default. Real pages, and
 * /admin/login outside the shell, are more specific and always win.
 */
export default function MissingAdminPage() {
  notFound();
}
