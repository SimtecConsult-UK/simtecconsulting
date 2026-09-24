import { requireEditor } from "../../lib/auth";
import { countCaseStudies, countPosts } from "./counts";
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
  const editor = await requireEditor();
  const [posts, caseStudies] = await Promise.all([
    countPosts(),
    countCaseStudies(),
  ]);

  return (
    <div className="cms-shell">
      <Sidebar
        email={editor.email ?? "Editor"}
        counts={{
          "/admin/newsletter": posts,
          "/admin/case-studies": caseStudies,
        }}
      />
      <main className="cms-main">{children}</main>
    </div>
  );
}
