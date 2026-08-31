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
          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-6">
            <Image
              src="/footer-logo-1.jpg"
              alt="Cyber Essentials Certified"
              width={100}
              height={100}
              className="w-[75px] h-auto object-contain"
              style={{ filter: "grayscale(1)", mixBlendMode: "multiply", marginLeft: "-22px" }}
            />
            <Image
              src="/footer-logo-2.webp"
              alt="Constructing Excellence in Wales"
              width={300}
              height={300}
              className="w-[225px] h-auto object-contain"
              style={{ filter: "grayscale(1)", mixBlendMode: "multiply" }}
            />
            <Image
              src="/logos/claire.png"
              alt="CL:AIRE - Leading Sustainable Land Reuse"
              width={246}
              height={70}
              className="w-[120px] h-auto object-contain"
              style={{ filter: "invert(1)" }}
            />
            <Image
              src="/logos/constructionline.png"
              alt="Constructionline Associate Member"
              width={1181}
              height={594}
              className="w-[88px] h-auto object-contain"
            />
            <Image
              src="/logos/remsoc.png"
              alt="RemSoc"
              width={1504}
              height={771}
              className="w-[88px] h-auto object-contain"
            />
            <Image
              src="/logos/ags.png"
              alt="AGS"
              width={968}
              height={268}
              className="w-[140px] h-auto object-contain"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-10 border-t border-black/10 pt-8 text-sm sm:grid-cols-3 sm:gap-8">
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wide text-black/40">
              Legal
            </h4>
            <ul className="mt-4 space-y-3">
              <li>
                <a href="#" className="text-black/60 hover:text-black">
                  Privacy &amp; Cookies Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-black/60 hover:text-black">
                  Cookie Settings
                </a>
              </li>
              <li>
                <a href="#" className="text-black/60 hover:text-black">
                  Client Terms &amp; Conditions
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-medium uppercase tracking-wide text-black/40">
              Contact
            </h4>
            <a
              href="mailto:hello@simtecconsult.com"
              className="mt-4 block text-black/60 hover:text-black"
            >
              hello@simtecconsult.com
            </a>
          </div>

          <div>
            <h4 className="text-xs font-medium uppercase tracking-wide text-black/40">
              Company Information
            </h4>
            <p className="mt-4 text-black/60">
              SIMTEC &reg; is a registered UK trade mark of Simtec Consult
              Ltd. Registration number UK00004264882.
            </p>
            <p className="mt-3 text-black/60">
              Registered office: Illtud House, Station Road, Llantwit Major,
              Vale of Glamorgan, Wales, CF61 1ST.
            </p>
            <p className="mt-3 text-black/60">
              VAT registration number: GB 406 7445 95.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-black/10 pt-8 text-xs text-black/50">
          <span>&copy; {new Date().getFullYear()} Simtec Consult Ltd. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
