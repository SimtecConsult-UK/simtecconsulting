import Link from "next/link";
import { BlogImage } from "./BlogImage";
import { formatPostDate } from "../../lib/blog/posts";
import { postHref } from "../../lib/sections";
import type { PostSummary } from "../../lib/blog/types";

/**
 * The card's own geometry, not the page's: both grids that use it have the
 * same column count and gaps at every tier, so the widths are derived from
 * `--bl-pad` and the column gaps in blog.css rather than from the artboard
 * widths, which are only exact at one viewport each.
 */
const CARD_SIZES = [
  "(min-width: 1600px) 480px",
  "(min-width: 1100px) calc((100vw - 192px) / 3)",
  "(min-width: 768px) calc((100vw - 92px) / 2)",
  "calc(100vw - 40px)",
].join(", ");

type PostCardProps = {
  post: PostSummary;
  /**
   * The related-articles band: smaller image, darker stripes, no description.
   * One class on the root — the stylesheet makes all three changes.
   */
  related?: boolean;
};

/**
 * Image → date → title → description. The whole card is one link, so nothing
 * inside it may be a link of its own (SPEC.md, "Implementation notes").
 */
export function PostCard({ post, related = false }: PostCardProps) {
  return (
    <Link
      href={postHref(post.slug)}
      className={`bl-card${related ? " bl-rel-card" : ""}`}
    >
      <BlogImage image={post.cover} className="bl-card-img" sizes={CARD_SIZES} />
      <span className="bl-meta bl-card-date">
        {formatPostDate(post.publishedAt)}
      </span>
      <h3 className="bl-h bl-card-title">{post.title}</h3>
      <p className="bl-card-desc">{post.standfirst}</p>
    </Link>
  );
}
