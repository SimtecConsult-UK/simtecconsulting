import Image from "next/image";

export function ImageBand() {
  return (
    <section className="relative flex min-h-screen items-center">

      {/* Background image */}
      <Image
        src="/image-section.jpg"
        alt="Construction site"
        fill
        className="object-cover object-center"
        priority
      />

      {/* Gradient overlay — dark on the left where text lives, fades out right */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.75) 35%, rgba(0,0,0,0.35) 65%, rgba(0,0,0,0.05) 100%)",
        }}
      />

      {/* Text — left side */}
      <div className="relative z-10 mx-auto w-full max-w-[var(--container-content)] px-4 py-24 md:px-16">
        <div className="max-w-[560px]">

          <h2
            className="text-[40px] font-bold leading-[1.06] tracking-[-0.02em] text-white sm:text-[50px] md:text-[58px]"
            style={{ fontFamily: "var(--font-league-spartan)" }}
          >
            Why Most Construction Software Projects Fail
          </h2>

          <p className="mt-6 text-[17px] leading-relaxed text-white/70">
            Many software projects fail because the real operational problem was never clearly defined in the first place. Construction businesses are often forced into rigid workflows, disconnected systems, generic software platforms, and poorly adopted processes.
          </p>

        </div>
      </div>

    </section>
  );
}
