import fs from "node:fs";
import path from "node:path";
import type { Facet } from "./products";

// Filter row markup lifted from the scraped sidebar (its <a href> to a dead
// category route swapped for an inert role="button" the client filter owns).
const rowTemplate = fs.readFileSync(path.join(process.cwd(), "content", "shop", "filter-row.html"), "utf8");

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function row(type: "cat" | "brand", slug: string, label: string): string {
  return rowTemplate
    .replaceAll("{{TYPE}}", type)
    .replaceAll("{{SLUG}}", slug)
    .replaceAll("{{LABEL}}", escapeHtml(label));
}

// "All" resets the group; facets follow, each labelled with its live count so the
// sidebar can't claim options the catalog doesn't actually have.
export function filterRowsHtml(type: "cat" | "brand", facets: Facet[], allLabel: string): string {
  return [
    row(type, "", allLabel),
    ...facets.map((f) => row(type, f.slug, `${f.label} (${f.count})`)),
  ].join("");
}
