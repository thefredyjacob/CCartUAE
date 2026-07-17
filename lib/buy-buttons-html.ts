import { SITE, type Retailer } from "./site";

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Generic, non-branded marks. Deliberately NOT the retailers' real logos: those
// are trademarks and no licensed assets ship with this project, so a neutral cart
// glyph is used and each button is identified by its name. Swap in official
// assets (with permission) by giving a retailer an `icon` url in site.json.
const CART_ICON =
  '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h2l2.4 10.5a2 2 0 0 0 2 1.5h7.7a2 2 0 0 0 2-1.5L21 8H6"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>';

// Retailer brand colours, used only as a button accent so the three options are
// visually distinguishable.
const ACCENT: Record<string, string> = {
  amazon: "#ff9900",
  noon: "#feee00",
  sharafdg: "#e4022d",
};
const ACCENT_TEXT: Record<string, string> = { noon: "#000" };

function button(r: Retailer): string {
  const bg = ACCENT[r.id] ?? "#000";
  const fg = ACCENT_TEXT[r.id] ?? "#fff";
  return (
    `<a class="hifi-buy-button" data-retailer="${escapeHtml(r.id)}" href="${escapeHtml(r.url)}"` +
    ` style="--hifi-buy-bg:${bg};--hifi-buy-fg:${fg}"` +
    ` aria-label="Buy on ${escapeHtml(r.label)}">${CART_ICON}<span>${escapeHtml(r.label)}</span></a>`
  );
}

/** Fills the {{BUY_BUTTONS}} slot: one external buy link per retailer. */
export function buyButtonsHtml(retailers: Retailer[] = SITE.retailers): string {
  return (
    '<div class="hifi-buy-row" data-hifi-name="Buy from">' +
    '<p class="hifi-buy-label">Shop from</p>' +
    `<div class="hifi-buy-buttons">${retailers.map(button).join("")}</div>` +
    "</div>"
  );
}
