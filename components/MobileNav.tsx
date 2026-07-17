"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/track", label: "Track" },
  { href: "/about-us", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/contact-us", label: "Contact us" },
];

// The scraped header ships a mobile hamburger button (data-framer-name="Navigation")
// but no menu: Framer's runtime built that overlay at render time, and it's gone.
// The button is real and styled, so wire it to a drawer of our own rather than
// leaving mobile with no way to navigate (the nav links are desktop-only).
export default function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const btn = (e.target as Element).closest('[data-framer-name="Navigation"]');
      if (!btn) return;
      e.preventDefault();
      setOpen((v) => !v);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // don't leave the page scrollable behind an open drawer
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="hifi-mobile-nav"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      onClick={() => setOpen(false)}
    >
      <nav className="hifi-mobile-nav-panel" onClick={(e) => e.stopPropagation()}>
        <button className="hifi-mobile-nav-close" aria-label="Close menu" onClick={() => setOpen(false)}>
          &times;
        </button>
        {/* Link, not <a>: satisfies no-html-link-for-pages for this literal "/"
            href. That makes it a client-side nav with no full reload, so unlike
            the plain <a> links below it won't implicitly reset `open` — close it
            explicitly. */}
        <Link href="/" className="hifi-mobile-nav-home" onClick={() => setOpen(false)}>
          <img src="/images/logo.png" alt="HiFi Store" className="hifi-logo" />
        </Link>
        {LINKS.map((l) => (
          <a key={l.href} href={l.href}>
            {l.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
