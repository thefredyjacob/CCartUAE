import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import PageShell from "@/components/PageShell";
import ShopFilters from "@/components/ShopFilters";
import { productCardHtml } from "@/lib/product-card-html";
import { filterRowsHtml } from "@/lib/filter-html";
import { PRODUCTS, CATEGORY_FACETS, BRAND_FACETS } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop Phone Accessories, Chargers, Cables & Power Banks | HiFi Store",
  description:
    "Browse chargers, power banks, cables and adapters, audio and phone accessories from Apple, Samsung, Huawei and Xiaomi.",
};

// The scraped Shop page is carved into fragments by scripts/build-shop-fragments.mjs:
// its dead filter widgets are cut out and regenerated from the real catalog, and
// its 17 template products are dropped entirely — the grid is the real catalog only.
// One grid per breakpoint, so cards are emitted twice in the matching variant.
const dir = path.join(process.cwd(), "content", "shop");
const frag = (name: string) => fs.readFileSync(path.join(dir, name), "utf8");

const [a1, a2, a3, b1, c1] = [
  "a1-chrome.html",
  "a2-chrome.html",
  "a3-chrome.html",
  "b1-chrome.html",
  "c1-chrome.html",
].map(frag);

const categoryRows = filterRowsHtml("cat", CATEGORY_FACETS, "All Products");
const brandRows = filterRowsHtml("brand", BRAND_FACETS, "All Brands");
const realDesktop = PRODUCTS.map((p) => productCardHtml(p, "desktop")).join("");
const realMobile = PRODUCTS.map((p) => productCardHtml(p, "mobile")).join("");

export default function Shop() {
  return (
    <>
      <PageShell
        segments={[a1, categoryRows, a2, brandRows, a3, realDesktop, b1, realMobile, c1]}
      />
      <ShopFilters />
    </>
  );
}
