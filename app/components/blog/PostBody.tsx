import { BlogImage } from "./BlogImage";
import type { BlogBlock, Run } from "../../lib/blog/types";

/** Matches --bl-measure in blog.css at each tier. */
const BODY_IMAGE_SIZES = [
  "(min-width: 1600px) 860px",
  "(min-width: 1100px) 760px",
  "(min-width: 768px) 660px",
  "calc(100vw - 40px)",
].join(", ");

/** Runs concatenate directly — the spacing is already part of each run. */
function Runs({ runs }: { runs: Run[] }) {
  return (
    <>
      {runs.map((run, i) => {
        let node: React.ReactNode = run.t;
        if (run.b) node = <strong>{node}</strong>;
        if (run.i) node = <em>{node}</em>;
        if (run.href) {
          return (
            <a key={i} href={run.href} target="_blank" rel="noopener noreferrer">
              {node}
            </a>
          );
        }
        return <span key={i}>{node}</span>;
      })}
    </>
  );
}

type PostBodyProps = {
  /** Rendered as the lead paragraph, in ink, above the body copy. */
  standfirst: string;
  blocks: BlogBlock[];
};

export function PostBody({ standfirst, blocks }: PostBodyProps) {
  return (
    <article className="bl-col bl-article">
      <p className="bl-lead">{standfirst}</p>

      {blocks.map((block, i) => {
        switch (block.t) {
          case "p":
            return (
              <p key={i} className="bl-para">
                <Runs runs={block.runs} />
              </p>
            );

          case "h2":
            return (
              <h2 key={i} className="bl-h bl-post-h2">
                {block.text}
              </h2>
            );

          case "ul":
            return (
              <ul key={i} className="bl-list">
                {block.items.map((item, j) => (
                  <li key={j}>
                    <Runs runs={item} />
                  </li>
                ))}
              </ul>
            );

          case "image":
            return (
              <BlogImage
                key={i}
                // In-body pictures are wider than they are tall; the intrinsic
                // size only has to carry the ratio for next/image.
                image={{ src: block.src, alt: block.alt, width: 1600, height: 700 }}
                className="bl-body-img"
                sizes={BODY_IMAGE_SIZES}
              />
            );
        }
      })}
    </article>
  );
}
