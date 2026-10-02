import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { BlogImage } from "../components/blog/BlogImage";
import { PostCard } from "../components/blog/PostCard";
import { ibmPlexSans } from "../lib/fonts";
import { formatPostDate, getIndex } from "../lib/blog/posts";
import { ROUTES, postHref } from "../lib/sections";
import { pageMetadata } from "../lib/seo/metadata";
import { SeoJsonLd } from "../components/SeoJsonLd";
import "../components/blog/blog.css";

/** The heading on the page itself. What search engines are told is edited at
    /admin/seo, and starts out saying the same thing. */
const PAGE_TITLE = "Notes from the floor";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata(ROUTES.blog);
}

/** The featured slot is the full content column, less the page padding. */
const FEATURED_SIZES = [
  "(min-width: 1600px) 1520px",
  "(min-width: 1100px) calc(100vw - 128px)",
  "(min-width: 768px) calc(100vw - 64px)",
  "100vw",
].join(", ");

export default async function BlogIndexPage() {
  const { featured, rest } = await getIndex();

  return (
    <>
      <SeoJsonLd path={ROUTES.blog} />
      <Nav solid />

      <main className={`${ibmPlexSans.variable} bl-root`}>
        <div className="bl-wrap bl-head">
          <span className="bl-meta bl-eyebrow">The Simtec Newsletter</span>
          <h1 className="bl-h bl-page-title">{PAGE_TITLE}</h1>
        </div>

        {featured ? (
          <>
            <div className="bl-wrap bl-feat-wrap">
              <Link href={postHref(featured.slug)} className="bl-featured">
                <BlogImage
                  image={featured.cover}
                  className="bl-feat-img"
                  sizes={FEATURED_SIZES}
                  priority
                >
                  <div className="bl-feat-overlay">
                    <span className="bl-meta bl-feat-eyebrow">
                      Latest · {formatPostDate(featured.publishedAt)}
                    </span>
                    <h2 className="bl-h bl-feat-title">{featured.title}</h2>
                    <p className="bl-feat-desc">{featured.standfirst}</p>
                  </div>
                </BlogImage>
              </Link>
            </div>

            {rest.length > 0 && (
              <div className="bl-wrap bl-grid">
                {rest.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="bl-wrap bl-empty">
            <p>There are no posts yet. Check back soon.</p>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
