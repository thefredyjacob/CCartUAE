import fs from "node:fs";
import path from "node:path";
import { PRODUCTS, CATEGORY_FACETS, type Facet } from "./products";

// Category tile markup lifted from the scraped homepage — see
// scripts/build-home-fragments.mjs.
const template = fs.readFileSync(
  path.join(process.cwd(), "content", "home", "category-tile.html"),
  "utf8"
);

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// No artwork ships for these categories, so borrow the first product's photo as
// the tile image — real data beats a placeholder, and it updates with the feed.
function categoryImage(category: string): string {
  const p = PRODUCTS.find((x) => x.category === category);
  if (!p) throw new Error(`no product found for category "${category}"`);
  return p.image;
}

function tile(facet: Facet): string {
  return template
    .replaceAll("{{CAT_HREF}}", "/shop")
    .replaceAll("{{CAT_NAME}}", escapeHtml(facet.label))
    .replaceAll("{{CAT_IMAGE}}", categoryImage(facet.label));
}

export function categoryTilesHtml(facets: Facet[] = CATEGORY_FACETS): string {
  return facets.map(tile).join("");
}
