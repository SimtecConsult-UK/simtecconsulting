"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "../auth-actions";

const SECTIONS = [
  { href: "/admin/newsletter", label: "Newsletter" },
  { href: "/admin/case-studies", label: "Case studies" },
  { href: "/admin/submissions", label: "Submissions" },
];

type SidebarProps = {
  email: string;
  /** How many items each section holds, shown beside its name. */
  counts: Record<string, number>;
};

export function Sidebar({ email, counts }: SidebarProps) {
  const pathname = usePathname();
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <aside className="cms-side">
      <Image
        src="/simtec-black.svg"
        alt="Simtec"
        width={100}
        height={20}
        style={{ height: 20, width: "auto", margin: "4px 8px 0" }}
      />

      <nav className="cms-side-nav">
        <span className="cms-label cms-side-head">Manage</span>
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="cms-side-link"
            aria-current={pathname.startsWith(section.href) ? "page" : undefined}
          >
            <span>{section.label}</span>
            <span className="cms-side-count">{counts[section.href] ?? 0}</span>
          </Link>
        ))}
      </nav>

      <div className="cms-side-foot">
        <Link href="/" className="cms-link-btn" style={{ padding: "0 10px" }}>
          View live site
        </Link>
        <div className="cms-side-user">
          <span className="cms-avatar">{initials}</span>
          <span style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
            <span
              style={{
                fontSize: 13.5,
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={email}
            >
              {email}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                style={{
                  fontFamily: "inherit",
                  fontSize: 12.5,
                  color: "var(--cms-faint)",
                  background: "none",
                  border: 0,
                  padding: 0,
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                Sign out
              </button>
            </form>
          </span>
        </div>
      </div>
    </aside>
  );
}
