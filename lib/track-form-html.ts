// The track form as an HTML string, because its two consumers need it that way:
// the homepage splices it into the scraped hero markup (a string), and the Track
// page renders it alongside server-rendered results. Keeping one source here
// beats a React component plus a hand-copied string that drift apart — Next
// forbids react-dom/server in app pages, so rendering the component to a string
// isn't an option.
//
// Plain GET form, no client JS: submitting navigates to /track?number=…, which
// the Track page resolves server-side. Results are shareable and work with JS off.
function escapeAttr(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// The hero card is 250px, leaving ~180px of input — the full placeholder needs
// 286px, so it clipped to "Enter your tracking number" and hid the only part
// that carries information (the format). The label already says what the field
// is, so the narrow variant shows the example instead.
const PLACEHOLDER_FULL = "Enter your tracking number e.g CRG-11-XXXX";
const PLACEHOLDER_SHORT = "e.g CRG-11-XXXX";

export function trackFormHtml(value = "", idSuffix = "", placeholder = PLACEHOLDER_FULL): string {
  const id = `track-number${idSuffix}`;
  return `<div class="hifi-track-form"><form method="get" action="/track"><label class="hifi-track-label" for="${id}">Enter Tracking Number Here</label><div class="hifi-track-controls"><input id="${id}" type="text" name="number" value="${escapeAttr(
    value
  )}" placeholder="${escapeAttr(placeholder)}" aria-label="Tracking number"><button type="submit" class="hifi-track-submit">Track Your Shipment</button></div></form></div>`;
}

export { PLACEHOLDER_SHORT };
