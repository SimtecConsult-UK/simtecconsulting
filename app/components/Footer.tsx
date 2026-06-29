import Image from "next/image";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="px-4 py-16 text-black md:px-16 md:py-24" style={{ background: "#ffffff" }}>
      <div className="mx-auto max-w-[var(--container-content)]">
        <div>
          <Logo />
          <p className="mt-6 max-w-xs text-sm text-black/60">
            Construction management software that helps teams deliver
            projects faster, safer, and on budget.
          </p>
          <div className="mt-0 flex items-center gap-[50px]">
            <Image
              src="/footer-logo-1.jpg"
              alt="Cyber Essentials Certified"
              width={100}
              height={100}
              className="w-[100px] h-auto object-contain"
              style={{ filter: "grayscale(1)", mixBlendMode: "multiply", marginLeft: "-22px" }}
            />
            <Image
              src="/footer-logo-2.webp"
              alt="Constructing Excellence in Wales"
              width={300}
              height={300}
              className="w-[300px] h-auto object-contain"
              style={{ filter: "grayscale(1)", mixBlendMode: "multiply" }}
            />
          </div>
        </div>

        <div className="mt-[14px] flex flex-col items-start justify-between gap-4 border-t border-black/10 pt-8 text-xs text-black/50 sm:flex-row sm:items-center">
          <span>&copy; {new Date().getFullYear()} Simtec, Inc.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-black">
              Privacy
            </a>
            <a href="#" className="hover:text-black">
              Terms
            </a>
            <a href="#" className="hover:text-black">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
