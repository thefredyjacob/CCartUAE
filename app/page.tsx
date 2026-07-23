import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import PageShell from "@/components/PageShell";
import { trackFormHtml, PLACEHOLDER_SHORT } from "@/lib/track-form-html";
import { productCardHtml } from "@/lib/product-card-html";
import { categoryTilesHtml } from "@/lib/category-tile-html";
import { BEST_SELLERS, NEW_ARRIVALS } from "@/lib/products";

export const metadata: Metadata = {
  title: "HiFi Store - Phone Accessories, Chargers, Cables & Power Banks",
  description:
    "Chargers, power banks, cables and adapters, audio and phone accessories from Apple, Samsung, Huawei and Xiaomi.",
};

// The scraped homepage is carved at four injection points by
// scripts/build-home-fragments.mjs and scripts/build-hero-track-form.mjs: its
// fictional audio/TV category tiles, its two rows of template products and the
// hero's Buy Now promo box are cut, and real content is rendered in.
// Merchandising rows come from mockdata/product-tags.json.
const home = fs.readFileSync(path.join(process.cwd(), "content", "home", "home.html"), "utf8");

// The category strip repeats once per breakpoint, so every marker gets the set.
const html = home
  .replaceAll("<!--HIFI_CATEGORIES-->", categoryTilesHtml())
  .replaceAll("<!--HIFI_TRACK_FORM-->", trackFormHtml("CRG-11-4821", "-hero", PLACEHOLDER_SHORT))
  // replaceAll: the rows are injected once per breakpoint track, same as categories
  .replaceAll("<!--HIFI_BEST_SELLERS-->", BEST_SELLERS.map((p) => productCardHtml(p, "bestSellers")).join(""))
  .replaceAll("<!--HIFI_NEW_ARRIVALS-->", NEW_ARRIVALS.map((p) => productCardHtml(p, "newArrivals")).join(""));

export default function Home() {
  return <PageShell html={html} />;
}
