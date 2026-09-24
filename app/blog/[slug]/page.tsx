import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "../../components/Nav";
import { Footer } from "../../components/Footer";
import { BlogImage } from "../../components/blog/BlogImage";
import { PostBody } from "../../components/blog/PostBody";
import { PostCard } from "../../components/blog/PostCard";
import { ShareRail } from "../../components/blog/ShareRail";
import { ibmPlexSans } from "../../lib/fonts";
import {
  formatPostDate,
  getPost,
  getPostSlugs,
  getRelatedPosts,
} from "../../lib/blog/posts";
import type { Post } from "../../lib/blog/types";
import { ROUTES, SITE_URL, postHref } from "../../lib/sections";
import "../../components/blog/blog.css";

/** Posts are published from the CMS, so the page is rebuilt periodically;
    saving also refreshes it immediately. */
export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(
  props: PageProps<"/blog/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPost(slug);
  if (!post) return {};

  const title = post.seo.metaTitle ?? post.title;
  const description = post.seo.metaDescription ?? post.standfirst;
  const href = postHref(post.slug);

  return {
    title: `${title} — Simtec`,
    description,
    alternates: { canonical: href },
    openGraph: {
      type: "article",
      title,
      description,
      url: href,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? undefined,
      images: post.cover.src ? [{ url: post.cover.src }] : undefined,
    },
  };
}

/**
 * Structured data. The CMS's "Search & AI visibility" panel feeds this: the
 * schema type, the key takeaway and the FAQ pairs all end up here rather than
 * anywhere a reader sees.
 */
function StructuredData({ post }: { post: Post }) {
  // Unlike the Metadata object, JSON-LD is emitted verbatim, so these have to
  // be absolute here.
  const url = `${SITE_URL}${postHref(post.slug)}`;

  const article = {
    "@context": "https://schema.org",
    "@type": post.seo.schemaType,
    headline: post.title,
    description: post.seo.keyTakeaway ?? post.standfirst,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    mainEntityOfPage: url,
    publisher: { "@type": "Organization", name: "Simtec Consult Ltd" },
    ...(post.cover.src ? { image: `${SITE_URL}${post.cover.src}` } : {}),
  };

  const faq =
    post.seo.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: post.seo.faqs.map((pair) => ({
            "@type": "Question",
            name: pair.q,
            acceptedAnswer: { "@type": "Answer", text: pair.a },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }}
      />
      {faq && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
        />
      )}
    </>
  );
}

export default async function BlogPostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  // Independent reads: once these are Supabase queries, doing them together
  // halves the page's latency.
  const [post, related] = await Promise.all([
    getPost(slug),
    getRelatedPosts(slug),
  ]);
  if (!post) notFound();

  return (
    <>
      <Nav solid />

      <main className={`${ibmPlexSans.variable} bl-root`}>
        <StructuredData post={post} />

        <BlogImage
          image={post.cover}
          className="bl-cover bl-img--dark"
          sizes="100vw"
          priority
        />

        <div className="bl-col bl-title-block">
          <Link href={ROUTES.blog} className="bl-meta bl-back">
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M13 8H3M7 4L3 8l4 4" />
            </svg>
            Back to blog
          </Link>
          <h1 className="bl-h bl-post-title">{post.title}</h1>
          <span className="bl-meta bl-post-date">{formatPostDate(post.publishedAt)}</span>
        </div>

        {/* One share component in one place in the DOM. Below 1100 this block
            is a plain stack, so the rail lands as a row above the article; from
            1100 up the block becomes a three-column grid and the same rail
            becomes the sticky left gutter. */}
        <div className="bl-body">
          <ShareRail slug={post.slug} title={post.title} />
          <PostBody standfirst={post.standfirst} blocks={post.body} />
        </div>

        {related.length > 0 && (
          <div className="bl-related">
            <div className="bl-wrap">
              <h2 className="bl-h bl-rel-heading">Related articles</h2>
              <div className="bl-rel-grid">
                {related.map((item) => (
                  <PostCard key={item.slug} post={item} related />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
