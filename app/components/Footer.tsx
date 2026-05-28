import { Logo } from "./Logo";

const columns = [
  {
    heading: "Solutions",
    links: ["Field Reporting", "RFIs & Submittals", "Safety", "Reporting"],
  },
  {
    heading: "Company",
    links: ["About", "Customers", "Careers", "Press"],
  },
  {
    heading: "Resources",
    links: ["Documentation", "Case Studies", "Webinars", "Help Center"],
  },
  {
    heading: "Contact",
    links: ["Sales", "Support", "Security", "Partners"],
  },
];

export function Footer() {
  return (
    <footer className="px-4 py-16 text-white md:px-16 md:py-24" style={{ background: "#111937" }}>
      <div className="mx-auto max-w-[var(--container-content)]">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:grid-cols-5">
          <div className="col-span-2 sm:col-span-3 md:col-span-1">
            <Logo />
            <p className="mt-6 max-w-xs text-sm text-white/70">
              Construction management software that helps teams deliver
              projects faster, safer, and on budget.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.heading}>
              <div className="text-xs font-semibold uppercase tracking-widest text-white/60">
                {column.heading}
              </div>
              <ul className="mt-4 space-y-3 text-sm text-white/85">
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="transition-colors hover:text-white"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
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
