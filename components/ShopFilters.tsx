"use client";

import { useEffect } from "react";

// The Shop grid is server-rendered HTML (scraped Framer markup + generated
// cards), not React, so filtering toggles card visibility in the DOM rather than
// re-rendering a list. Cards carry data-cat/data-brand; rows carry
// data-filter="cat|brand" and data-slug ("" = the All reset).
export default function ShopFilters() {
  useEffect(() => {
    const selected: Record<string, string> = { cat: "", brand: "" };

    const rows = () => Array.from(document.querySelectorAll<HTMLElement>("[data-filter]"));
    const cards = () =>
      Array.from(document.querySelectorAll<HTMLElement>("[data-cat],[data-brand]"));

    function apply() {
      for (const card of cards()) {
        const cat = card.dataset.cat ?? "";
        const brand = card.dataset.brand ?? "";
        // A card matches only if it satisfies every active facet. Scraped
        // template cards carry no data-* values, so any active filter hides them.
        const ok =
          (!selected.cat || cat === selected.cat) && (!selected.brand || brand === selected.brand);
        card.style.display = ok ? "" : "none";
      }
      for (const row of rows()) {
        const type = row.dataset.filter!;
        row.classList.toggle("hifi-filter-on", (row.dataset.slug ?? "") === selected[type]);
      }
    }

    function onClick(e: MouseEvent) {
      const row = (e.target as Element).closest<HTMLElement>("[data-filter]");
      if (!row) return;
      e.preventDefault();
      const type = row.dataset.filter!;
      const slug = row.dataset.slug ?? "";
      // clicking the active facet clears it; "All" (slug "") always clears
      selected[type] = selected[type] === slug ? "" : slug;
      apply();
    }

    function onKey(e: KeyboardEvent) {
      if (e.key !== "Enter" && e.key !== " ") return;
      const row = (e.target as Element).closest<HTMLElement>("[data-filter]");
      if (!row) return;
      e.preventDefault();
      row.click();
    }

    // "Clear all" lives in the scraped chrome and has no data-filter of its own.
    function onClear(e: MouseEvent) {
      const el = (e.target as Element).closest<HTMLElement>("[data-hifi-clear]");
      if (!el) return;
      e.preventDefault();
      selected.cat = "";
      selected.brand = "";
      apply();
    }

    document.addEventListener("click", onClear);
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    apply();
    return () => {
      document.removeEventListener("click", onClear);
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return null;
}
