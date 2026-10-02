import Link from "next/link";
import { Chevron } from "../../icons";
import { formatPostDate } from "../../../lib/blog/posts";
import { listPosts } from "./data";

export default async function NewsletterListPage() {
  const posts = await listPosts();

  return (
    <div className="cms-page">
      <div className="cms-page-head">
        <div>
          <h1 className="cms-h">Newsletter</h1>
          <p>Posts appear on the blog in published order, newest first.</p>
        </div>
        <Link href="/admin/newsletter/new" className="cms-btn cms-btn--primary">
          New post
        </Link>
      </div>

      <div className="cms-rows">
        {posts.map((post) => (
          <Link key={post.id} href={`/admin/newsletter/${post.id}`} className="cms-row">
            <span className="cms-row-thumb">
              {post.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.coverUrl} alt="" />
              ) : (
                "NO COVER"
              )}
            </span>
            <span className="cms-row-body">
              <span style={{ display: "flex", alignItems: "center", gap: 11, flexWrap: "wrap" }}>
                <span className="cms-row-title">{post.title || "Untitled post"}</span>
                <span className={`cms-chip${post.status === "published" ? " cms-chip--live" : ""}`}>
                  {post.status === "published" ? "Live" : "Draft"}
                </span>
              </span>
              <span className="cms-row-meta">
                {post.publishedAt ? formatPostDate(post.publishedAt) : "Not published"} · /blog/{post.slug}
              </span>
            </span>
            <Chevron />
          </Link>
        ))}

        {posts.length === 0 && (
          <div className="cms-empty">Nothing here yet. Write your first post.</div>
        )}
      </div>
    </div>
  );
}
