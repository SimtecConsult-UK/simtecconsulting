import Image from "next/image";

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
const GRID = [
  "/team-photos/2.jpeg",
  "/team-photos/3.jpeg",
  "/team-photos/4.jpeg",
  "/team-photos/5.jpeg",
];

export function Team() {
  return (
    <section
      className="px-5 py-14 md:px-10 md:py-[74px] lg:px-16 lg:py-[88px]"
      style={{ background: "#e8eaf4", overflow: "hidden" }}
    >
      <div className="mx-auto max-w-[1200px]">
        <h2
          className="team-heading font-heading tracking-[-0.022em]"
          style={{ color: "#1a1530", lineHeight: 1.06, fontWeight: 700, margin: 0 }}
        >
          The people
          <br className="team-br" />{" "}
          behind Simtec.
        </h2>

        {/* Hero photo */}
        <div className="team-tile team-hero" style={{ marginTop: 32 }}>
          <Image
            src="/team-photos/1.jpeg"
            alt="The Simtec team"
            fill
            sizes={HERO_SIZES}
            style={{ objectFit: "cover" }}
          />
        </div>

        {/* 4-photo grid */}
        <div className="team-grid">
          {GRID.map((src, i) => (
            <div key={src} className="team-tile">
              <Image
                src={src}
                alt={`Simtec team member ${i + 2}`}
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
