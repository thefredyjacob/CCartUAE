import fs from "node:fs";
import path from "node:path";
import siteRaw from "@/mockdata/site.json";

// Editable site content (business details, retailer links). Kept in JSON and
// injected into the scraped markup via {{TOKENS}} rather than hardcoded into the
// HTML, so swapping this module's source for a CMS fetch is the only change
// needed when the backend lands.
export const SITE = siteRaw;

export type Retailer = (typeof siteRaw.retailers)[number];

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const LOCATION_TOKENS: Record<string, string> = {
  "{{LOCATION_NAME}}": SITE.location.name,
  "{{LOCATION_CATEGORY}}": SITE.location.category,
  "{{LOCATION_ADDRESS}}": SITE.location.address,
  "{{LOCATION_PHONE}}": SITE.location.phone,
  "{{LOCATION_HOURS_1}}": SITE.location.hours[0] ?? "",
  "{{LOCATION_HOURS_2}}": SITE.location.hours[1] ?? "",
};

/** Reads a scraped page and fills its site-content tokens. */
export function getPageHtml(name: string): string {
  let html = fs.readFileSync(path.join(process.cwd(), "content", "pages", `${name}.html`), "utf8");
  for (const [token, value] of Object.entries(LOCATION_TOKENS)) {
    html = html.replaceAll(token, escapeHtml(value));
  }
  return html;
}
