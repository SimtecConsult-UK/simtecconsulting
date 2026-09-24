import Image from "next/image";
import type { PostImage } from "../../lib/blog/types";

type BlogImageProps = {
  image: PostImage;
  /** Sets the slot's height, and the darker stripe pair where the design uses it. */
  className: string;
  /** Passed to next/image so each slot downloads a sensibly sized file. */
  sizes: string;
  priority?: boolean;
  /** Drawn over the picture — the featured block's gradient and text. */
  children?: React.ReactNode;
};

/**
 * One image slot. When the CMS has no picture for the post yet, `src` is null
 * and the slot renders as the design's striped placeholder — the element keeps
 * its height either way, so the page never reflows once real imagery arrives.
 *
 * The stripes are a separate class so a slot that does have a picture, which
 * covers them completely, does not pay to rasterise a gradient nobody sees.
 */
export function BlogImage({
  image,
  className,
  sizes,
  priority,
  children,
}: BlogImageProps) {
  return (
    <div className={`bl-img ${image.src ? "" : "bl-img--empty "}${className}`}>
      {image.src && (
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes={sizes}
          priority={priority}
        />
      )}
      {children}
    </div>
  );
}
