"use client";

import { useEffect } from "react";

// The scraped Best Sellers / Shop by Categories / New Arrivals rows each ship a
// Left-stop/Right arrow pair (data-framer-name), but Framer's runtime — which
// used to wire their click-to-scroll — is gone, so they've never actually
// scrolled anything, on any breakpoint. Same document-level delegation pattern
// as MobileNav's hamburger, so one listener covers every row on every page
// without touching the scraped markup's event wiring per-instance.
//
// Layout: each arrow's closest [data-framer-name="Left"] ancestor is the same
// wrapper that contains the row's own .framer-fnblpo scroll container as a
// sibling — true for all three sections, so no per-section special-casing.
export default function CarouselArrows() {
  useEffect(() => {
    function scrollRowFor(target: Element) {
      const wrap = target.closest('[data-framer-name="Left"]');
      return wrap?.querySelector<HTMLElement>(".framer-fnblpo") ?? null;
    }
    function directionFor(target: Element): 1 | -1 | null {
      if (target.closest('[data-framer-name="Left stop"]')) return -1;
      if (target.closest('[data-framer-name="Right"]')) return 1;
      return null;
    }
    function scrollByOnePage(row: HTMLElement, dir: 1 | -1) {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      row.scrollBy({ left: dir * row.clientWidth * 0.85, behavior: reduceMotion ? "auto" : "smooth" });
    }

    function activate(el: Element) {
      const dir = directionFor(el);
      if (!dir) return false;
      const row = scrollRowFor(el);
      if (!row) return false;
      scrollByOnePage(row, dir);
      return true;
    }
    function onClick(e: MouseEvent) {
      if (activate(e.target as Element)) e.preventDefault();
    }
    // the scraped arrows are <div tabindex="0">, not <button> — Enter/Space
    // need an explicit handler, native buttons would get this for free
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Enter" && e.key !== " ") return;
      if (activate(e.target as Element)) e.preventDefault();
    }

    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return null;
}
