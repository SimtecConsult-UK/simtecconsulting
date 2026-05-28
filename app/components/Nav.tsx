import { Logo } from "./Logo";

const links = [
  { label: "Solutions", href: "#solutions" },
  { label: "Company", href: "#company" },
  { label: "Resources", href: "#resources" },
];

export function Nav() {
  return (
    <nav className="relative z-20 w-full">
      <div className="mx-auto flex max-w-[var(--container-content)] items-center justify-between px-4 py-5 md:px-16">
        <Logo />
        <ul className="hidden items-center gap-10 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-[15px] font-semibold text-white/90 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href="#contact"
          className="inline-flex items-center justify-center rounded-full bg-[var(--color-brand-blue)] px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#5d7dfa]"
        >
          Speak to us
        </a>
      </div>
    </nav>
  );
}
