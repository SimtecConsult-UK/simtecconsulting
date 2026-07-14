import Image from "next/image";
import { TickerFades } from "./TickerFades";

const logos = [
  { name: "Balfour Beatty", src: "/logos/balfour-beatty.png", width: 500, height: 83 },
  { name: "Booth Group", src: "/logos/booth-group.png", width: 185, height: 96 },
  { name: "Collins", src: "/logos/collins.png", width: 259, height: 107 },
  { name: "Ecofficiency", src: "/logos/ecofficiency.png", width: 500, height: 113 },
  { name: "Eurofins", src: "/logos/eurofins.png", width: 500, height: 102 },
  { name: "RRM", src: "/logos/rrm.svg", width: 417, height: 62 },
  { name: "SoilEx", src: "/logos/soilex.png", width: 225, height: 111 },
  { name: "Vertase FLI", src: "/logos/vertase-fli.svg", width: 113, height: 88 },
  { name: "Compli Digital", src: "/logos/compli-digital.png", width: 123, height: 96 },
  { name: "Foxtree", src: "/logos/foxtree.svg", width: 142, height: 141 },
  { name: "Geotechnical", src: "/logos/geotechnical.png", width: 159, height: 96 },
  { name: "Jackson Drilling", src: "/logos/jackson-drilling.svg", width: 519, height: 171 },
  { name: "Jackson Geo Services", src: "/logos/jackson-geo-services.svg", width: 470, height: 166 },
  { name: "CL:AIRE", src: "/logos/claire.png", width: 246, height: 70 },
  { name: "Murray Environmental", src: "/logos/murray-environmental.png", width: 181, height: 96 },
  { name: "Prichard's", src: "/logos/prichards.png", width: 500, height: 91 },
];

function LogoTile({ logo, isDuplicate }: { logo: (typeof logos)[number]; isDuplicate: boolean }) {
  return (
    <div
      key={isDuplicate ? `${logo.name}-dup` : logo.name}
      className="flex h-10 w-40 flex-shrink-0 items-center justify-center px-3 opacity-80"
      aria-label={isDuplicate ? undefined : logo.name}
      aria-hidden={isDuplicate || undefined}
    >
      <Image
        src={logo.src}
        alt={isDuplicate ? "" : logo.name}
        width={logo.width}
        height={logo.height}
        className="max-h-8 w-auto max-w-full object-contain"
      />
    </div>
  );
}

export function PartnerLogos() {
  return (
    <section className="logo-band">
      {/* Continuous marquee at every breakpoint — kept to a single row */}
      <div className="relative py-3" style={{ overflow: "hidden" }}>
        <TickerFades color="#0b0a0c" />
        <div className="logo-ticker-track flex items-center" style={{ width: "max-content" }}>
          {logos.map((logo) => (
            <LogoTile key={logo.name} logo={logo} isDuplicate={false} />
          ))}
          {/* Duplicate, hidden from a11y — closes the loop for the seamless marquee */}
          {logos.map((logo) => (
            <LogoTile key={`${logo.name}-dup`} logo={logo} isDuplicate={true} />
          ))}
        </div>
      </div>
    </section>
  );
}
