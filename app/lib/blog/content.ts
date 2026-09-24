import type { BlogBlock, Post, PostSeo } from "./types";

/**
 * Sample posts, standing in for the CMS until the Newsletter collection is
 * connected. The copy is the lorem ipsum from the approved designs and the
 * cover images are deliberately absent, which renders the design's striped
 * placeholder — so these pages match the handover screens exactly and can be
 * signed off before any real article or photograph exists.
 *
 * Replacing this file is the whole job of switching to the CMS; nothing else
 * reads it directly (see `posts.ts`).
 */

const p = (text: string): BlogBlock => ({ t: "p", runs: [{ t: text }] });

/** No SEO overrides: the page falls back to the title and standfirst. */
const NO_SEO: PostSeo = {
  metaTitle: null,
  metaDescription: null,
  keyTakeaway: null,
  faqs: [],
  schemaType: "Article",
};

/**
 * One published sample post. Every field that is the same across the samples —
 * no picture, never revised, no SEO overrides — lives here rather than being
 * repeated seven times.
 */
function sample(
  slug: string,
  title: string,
  standfirst: string,
  publishedAt: string,
  heading: string
): Post {
  return {
    slug,
    title,
    standfirst,
    cover: { src: null, alt: "Cover image placeholder", width: 1600, height: 900 },
    publishedAt,
    updatedAt: null,
    status: "published",
    body: [
      p(
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
      ),
      { t: "h2", text: heading },
      p(
        "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt."
      ),
      { t: "image", src: null, alt: "In-body image placeholder" },
      p(
        "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident."
      ),
      p(
        "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus."
      ),
    ],
    seo: NO_SEO,
  };
}

export const POSTS: Post[] = [
  sample(
    "lorem-ipsum-dolor-sit-amet-consectetur",
    "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do",
    "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute.",
    "2026-09-12",
    "Neque porro quisquam est"
  ),
  sample(
    "sed-ut-perspiciatis-unde-omnis-iste-natus-error",
    "Sed ut perspiciatis unde omnis iste natus error",
    "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit consequuntur magni.",
    "2026-09-04",
    "Totam rem aperiam eaque ipsa"
  ),
  sample(
    "neque-porro-quisquam-est-qui-dolorem-ipsum-quia",
    "Neque porro quisquam est qui dolorem ipsum quia",
    "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae.",
    "2026-08-28",
    "Ut enim ad minima veniam"
  ),
  sample(
    "at-vero-eos-et-accusamus-et-iusto-odio",
    "At vero eos et accusamus et iusto odio dignissimos",
    "Et harum quidem rerum facilis est et expedita distinctio nam libero tempore cum soluta.",
    "2026-08-19",
    "Similique sunt in culpa"
  ),
  sample(
    "temporibus-autem-quibusdam-et-aut-officiis-debitis",
    "Temporibus autem quibusdam et aut officiis debitis",
    "Ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores.",
    "2026-08-07",
    "Aut rerum necessitatibus"
  ),
  sample(
    "itaque-earum-rerum-hic-tenetur-a-sapiente-delectus",
    "Itaque earum rerum hic tenetur a sapiente delectus",
    "Nam libero tempore cum soluta nobis est eligendi optio cumque nihil impedit quo minus.",
    "2026-07-22",
    "Ut aut reiciendis voluptatibus"
  ),
  sample(
    "quis-autem-vel-eum-iure-reprehenderit-qui-in-ea",
    "Quis autem vel eum iure reprehenderit qui in ea",
    "Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit.",
    "2026-07-10",
    "Omnis voluptas assumenda est"
  ),
];
