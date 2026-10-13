import Image from "next/image";
import { getTeamPhotos } from "../lib/homepage/data";
import { SECTION_IDS } from "../lib/sections";

// Hero photo + 4-photo grid (design: "Team Section 1b"). Asymmetric corner
// radii give each tile one sharp corner; the radii flip between the 4-col
// (desktop) and 2-col (tablet/mobile) layouts — handled in globals.css.
// Tile widths track the centered max-w-[1200px] container (minus section
// padding and grid gaps), so above ~1328px they stop growing with the viewport
// — a fixed px keeps the browser from fetching an oversized variant on wide screens.
// 4-col at ≥1000 (~25vw), 2-col below (~50vw).
const GRID_SIZES =
  "(min-width:1328px) 290px, (min-width:1000px) calc(25vw - 42px), (min-width:768px) calc(50vw - 46px), calc(50vw - 25px)";
const HERO_SIZES =
  "(min-width:1328px) 1200px, (min-width:1024px) calc(100vw - 128px), (min-width:768px) calc(100vw - 80px), calc(100vw - 40px)";

/**
 * The photos themselves come from /admin/team — five fixed tiles, each showing
 * the file committed in /public until one is uploaded over it.
 */
export async function Team() {
  const [hero, ...grid] = await getTeamPhotos();

  return (
    <section
      id={SECTION_IDS.team}
      className="px-5 py-14 md:px-10 md:py-[74px] lg:px-16 lg:py-[88px]"
      style={{ background: "var(--color-tinted-bg)", overflow: "hidden" }}
    >
      <div className="mx-auto max-w-[1200px]">
        <h2
          className="team-heading font-heading tracking-[-0.022em]"
          style={{ color: "#1a1530", lineHeight: 1.06, fontWeight: 700, margin: 0 }}
        >
          The people
          <br className="team-br" />{" "}
          behind the systems.
        </h2>

        {/* Hero photo */}
        <div className="team-tile team-hero" style={{ marginTop: 32 }}>
          <Image
            src={hero.src}
            alt={hero.alt}
            fill
            sizes={HERO_SIZES}
            style={{ objectFit: "cover" }}
          />
        </div>

        {/* 4-photo grid */}
        <div className="team-grid">
          {grid.map((photo) => (
            <div key={photo.slot} className="team-tile">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes={GRID_SIZES}
                style={{ objectFit: "cover" }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
