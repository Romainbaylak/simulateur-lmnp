"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import HeaderAuth from "@/components/HeaderAuth";

const NAV_LINKS = [
  { href: "/comment-ca-marche", label: "LMNP" },
  { href: "/blog", label: "Articles" },
  { href: "/tarifs", label: "Abonnements" },
  { href: "/contact", label: "Contact" },
];

export default function MobileHeader({ simulerHref = "/#simulateur" }: { simulerHref?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ─── Mobile header (< md) ─── */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 relative"
        style={{ backgroundColor: "#4E1F12" }}>
        {/* Left: Simuler */}
        <a href={simulerHref}
          className="text-xs font-medium px-3 py-2 transition-opacity hover:opacity-[0.88] shrink-0"
          style={{ backgroundColor: "#C95B2A", color: "#F5F0E8", borderRadius: 6 }}>
          Simuler
        </a>

        {/* Centre: Logo */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <Logo variant="light" />
        </Link>

        {/* Right: Se connecter + hamburger */}
        <div className="flex items-center gap-2 shrink-0">
          <HeaderAuth dark={true} />
          <button
            onClick={() => setOpen(o => !o)}
            aria-label="Menu"
            className="flex flex-col justify-center items-center w-9 h-9 gap-[5px] rounded"
            style={{ background: "rgba(245,240,232,0.12)" }}>
            <span className="block w-5 h-[1.5px] rounded-full" style={{ background: "#F5F0E8", transition: "transform .2s", transform: open ? "translateY(6.5px) rotate(45deg)" : "none" }} />
            <span className="block w-5 h-[1.5px] rounded-full" style={{ background: "#F5F0E8", opacity: open ? 0 : 1, transition: "opacity .15s" }} />
            <span className="block w-5 h-[1.5px] rounded-full" style={{ background: "#F5F0E8", transition: "transform .2s", transform: open ? "translateY(-6.5px) rotate(-45deg)" : "none" }} />
          </button>
        </div>
      </div>

      {/* ─── Dropdown nav (mobile) ─── */}
      {open && (
        <div className="md:hidden flex flex-col" style={{ backgroundColor: "#3a1509", borderTop: "1px solid rgba(245,240,232,0.1)" }}>
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href}
              onClick={() => setOpen(false)}
              className="px-6 py-4 text-sm font-medium transition-opacity hover:opacity-80"
              style={{ color: "#F5F0E8", borderBottom: "0.5px solid rgba(245,240,232,0.08)" }}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
