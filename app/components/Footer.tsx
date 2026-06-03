import Image from "next/image";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="px-4 py-16 text-white md:px-16 md:py-24" style={{ background: "#111937" }}>
      <div className="mx-auto max-w-[var(--container-content)]">
        <div>
          <Logo white />
          <p className="mt-6 max-w-xs text-sm text-white/70">
            Construction management software that helps teams deliver
            projects faster, safer, and on budget.
          </p>
          <div className="mt-8 flex items-center gap-[50px]">
            <Image
              src="/footer-logo-2.webp"
              alt="Constructing Excellence in Wales"
              width={300}
              height={300}
              className="w-[300px] h-auto object-contain"
              style={{ filter: "invert(1) grayscale(1)", mixBlendMode: "screen" }}
            />
            <Image
              src="/footer-logo-1.jpg"
              alt="Cyber Essentials Certified"
              width={100}
              height={100}
              className="w-[100px] h-auto object-contain"
              style={{ filter: "invert(1) grayscale(1)", mixBlendMode: "screen" }}
            />
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/60 sm:flex-row sm:items-center">
          <span>&copy; {new Date().getFullYear()} Simtec, Inc.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">
              Privacy
            </a>
            <a href="#" className="hover:text-white">
              Terms
            </a>
            <a href="#" className="hover:text-white">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
