import fs from "node:fs";
import path from "node:path";
import type { Product } from "./products";

// Card markup lifted verbatim from each context that actually renders one, with
// the product-specific bits tokenised. NOT interchangeable — desktop/mobile use
// different Framer variant classes (favourite-button offsets, control sizes),
// and Home's two rows use different Framer component *instances* than the Shop
// grid (their own wrapper classes with their own correctly-scoped CSS). Reusing
// Shop's desktop card on Home broke card sizing: Shop's card relies on
// `.framer-8e639 .framer-1s9dwpj-container{flex:none}`, scoped to Shop's own
// page-root class, which doesn't exist on Home — see
// scripts/extract-home-card-templates.mjs.
const dir = path.join(process.cwd(), "content");
const templates = {
  desktop: fs.readFileSync(path.join(dir, "product-card-desktop.html"), "utf8"),
  mobile: fs.readFileSync(path.join(dir, "product-card-mobile.html"), "utf8"),
  bestSellers: fs.readFileSync(path.join(dir, "home", "card-best-sellers.html"), "utf8"),
  newArrivals: fs.readFileSync(path.join(dir, "home", "card-new-arrivals.html"), "utf8"),
};

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function productCardHtml(product: Product, variant: keyof typeof templates = "desktop"): string {
  return templates[variant]
    .replaceAll("{{IMAGE}}", product.image)
    .replaceAll("{{HREF}}", `/products/${product.slug}`)
    .replaceAll("{{NAME}}", escapeHtml(product.name))
    .replaceAll("{{APPEAR_ID}}", `p-${product.id}`)
    .replaceAll("{{CAT}}", slugify(product.category))
    .replaceAll("{{BRAND}}", slugify(product.brand));
}
