import fs from "node:fs";
import path from "node:path";
import type { Product, ProductDetail } from "./products";
import { buyButtonsHtml } from "./buy-buttons-html";

// The site's real product-detail page (scraped VisionMax), with product-specific
// bits tokenised — see scripts/extract-product-template.mjs. Reusing it means
// generated mock products get the full site design (gallery, breadcrumb, tabs,
// reviews, "You may also like") instead of a hand-written lookalike.
const template = fs.readFileSync(
  path.join(process.cwd(), "content", "product-detail-template.html"),
  "utf8"
);

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Framer's rich-text uses preset classes for typography; match them so injected
// copy inherits the site's styles rather than browser defaults.
const P = 'class="framer-text framer-styles-preset-piej36"';

// Short blurb under the price. Mock data has no marketing copy, so seed a factual
// line from the fields it does carry.
function taglineHtml(product: Product): string {
  const rating =
    product.rating && product.reviewCount
      ? ` Rated ${product.rating}/5 from ${product.reviewCount} reviews.`
      : "";
  return `<p ${P} data-styles-preset="kzFJG5mqZ">Genuine ${escapeHtml(product.brand)} ${escapeHtml(
    product.category
  ).toLowerCase()}, backed by our standard warranty and returns.${rating}</p>`;
}

// Fills a whole <p> element slot (the template's own <p> is replaced, so emit a
// complete one here — a <p> nested in a <p> is invalid and breaks the parse).
function overviewHtml(product: Product): string {
  // Mock data ships no prose description, so state only what it actually knows.
  const stock = product.inStock ? "In stock and ready to ship." : "Currently out of stock.";
  return `<p ${P}>${escapeHtml(product.name)} — ${escapeHtml(product.brand)} ${escapeHtml(
    product.category
  ).toLowerCase()}. ${stock}</p>`;
}

function specsHtml(detail: ProductDetail): string {
  const items = detail.specifications
    // the template has a dedicated "Brand:" field just below this list, so don't
    // repeat it here
    .filter((sp) => sp.label.toLowerCase() !== "brand")
    .map(
      (sp) =>
        `<li data-preset-tag="p" ${P}><p ${P}><strong class="framer-text">${escapeHtml(
          sp.label
        )}:</strong> ${escapeHtml(sp.value)}</p></li>`
    )
    .join("");
  return `<p ${P}><strong class="framer-text">Details:</strong></p><ul class="framer-text">${items}</ul>`;
}

function priceHtml(product: Product): string {
  const hasDiscount = product.regularPrice > product.price;
  const was = hasDiscount
    ? ` <span style="text-decoration:line-through;opacity:0.5;font-weight:400">${product.currency} ${product.regularPrice.toFixed(2)}</span>`
    : "";
  return `<p ${P} style="font-size:22px;font-weight:600">${product.currency} ${product.price.toFixed(2)}${was}</p>`;
}

export function renderProductDetail(product: Product, detail: ProductDetail): string {
  return template
    .replaceAll("{{IMAGE}}", detail.gallery[0] ?? product.image)
    .replaceAll("{{NAME}}", escapeHtml(product.name))
    .replaceAll("{{CATEGORY}}", escapeHtml(product.category))
    .replaceAll("{{BRAND}}", escapeHtml(product.brand))
    .replaceAll("{{BUY_BUTTONS}}", buyButtonsHtml())
    .replaceAll("{{TAGLINE}}", taglineHtml(product))
    .replaceAll("{{OVERVIEW}}", overviewHtml(product))
    .replaceAll("{{SPECS}}", specsHtml(detail))
    .replaceAll("{{PRICE}}", priceHtml(product));
}
