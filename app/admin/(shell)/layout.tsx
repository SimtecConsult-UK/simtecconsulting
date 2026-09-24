import { requireEditor } from "../../lib/auth";
import { isSupabaseConfigured } from "../../lib/supabase/config";
import { countCaseStudies, countPosts, countUnreadSubmissions } from "./counts";
import { NotConnected } from "./NotConnected";
import { Sidebar } from "./Sidebar";

/**
 * Everything behind the sign-in.
 *
 * `requireEditor()` is the real gate — proxy.ts only redirects early as a
 * convenience, and Next's own guidance is not to rely on it. Every page under
 * this layout is therefore protected even if the proxy never ran.
 */
export default async function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Asked before requireEditor(), because with no project configured there is
  // nobody to be signed in as: that check would send the editor to a sign-in
  // form that cannot succeed and never says why. One check here covers every
  // page under the shell.
  if (!isSupabaseConfigured) {
    return (
      <div className="cms-shell">
        <main className="cms-main">
          <NotConnected />
        </main>
      </div>
    );
  }

  const editor = await requireEditor();
  const [posts, caseStudies, submissions] = await Promise.all([
    countPosts(),
    countCaseStudies(),
    countUnreadSubmissions(),
  ]);

  return (
    <div className="cms-shell">
      <Sidebar
        email={editor.email ?? "Editor"}
        counts={{
          "/admin/newsletter": posts,
          "/admin/case-studies": caseStudies,
          "/admin/submissions": submissions,
        }}
      />
      <main className="cms-main">{children}</main>
    </div>
  );
}
