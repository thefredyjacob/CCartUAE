import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import PageShell from "@/components/PageShell";
import { trackFormHtml } from "@/lib/track-form-html";
import { findShipment, formatEventDate } from "@/lib/shipments";

export const metadata: Metadata = {
  title: "Track & Trace Shipment | HiFi Store",
  description: "Track your Commercial Cart shipment. Enter your tracking number for live delivery status.",
};

// The banner is the real scraped page chrome, lifted by
// scripts/extract-page-banner.mjs so this page matches About/Contact exactly.
const banner = fs
  .readFileSync(path.join(process.cwd(), "content", "page-banner.html"), "utf8")
  .replaceAll("{{TITLE}}", "Track &amp; Trace");

// Lookup runs on the server off the query string: the form is a plain GET, so
// tracking a shipment works without client JS and the result URL is shareable.
export default async function Track({
  searchParams,
}: {
  searchParams: Promise<{ number?: string }>;
}) {
  const { number = "" } = await searchParams;
  const query = number.trim();
  const shipment = query ? findShipment(query) : undefined;
  // Nothing to look up yet: seed a real tracking number so the demo works with
  // one click on Track Your Shipment instead of requiring a number to be typed
  // (or copied from elsewhere) first.
  const SEED_TRACKING = "CRG-11-4821";
  const inputValue = query || SEED_TRACKING;

  return (
    <PageShell html={banner}>
      <section className="hifi-track" data-section="track-form">
        <div className="hifi-track-inner">
          <div className="hifi-track-title">
            <h2>
              Track &amp; <span>Trace Shipment</span>
            </h2>
            <div className="hifi-track-separator" />
          </div>

          <div dangerouslySetInnerHTML={{ __html: trackFormHtml(inputValue) }} />

          {/* role="alert" not "status": a failed lookup is an error, and it must
              interrupt a screen reader rather than wait for a pause. */}
          {query && !shipment && (
            <p className="hifi-track-empty" role="alert">
              No shipment found for <strong>{query}</strong>. Check the number and try again, or{" "}
              <a href="/contact-us">contact support</a>.
            </p>
          )}

          {!query && (
            <p className="hifi-track-hint">
              Enter the tracking number from your confirmation email — it looks like{" "}
              <strong>CRG-11-4821</strong>.
            </p>
          )}

          {shipment && (
            <>
              <p className="hifi-track-meta" role="status">
                <strong>{shipment.tracking}</strong> · {shipment.service} · to {shipment.destination}
              </p>
              <ol className="hifi-track-list" data-section="track-results">
                {shipment.events.map((e, i) => (
                  <li className="hifi-track-item" key={i}>
                    <div className="hifi-track-when">
                      <div className="hifi-track-date">{formatEventDate(e.date)}</div>
                      <span>{e.time}</span>
                    </div>
                    {/* events[0] is the newest status — the one still "on-going" until a
                        newer one supersedes it. Everything below it already happened. */}
                    <div className={`hifi-track-dot ${i === 0 ? "on-going" : "is-complete"}`} />
                    <div className="hifi-track-where">
                      <strong>{e.title}</strong>
                      {e.location}
                    </div>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      </section>
    </PageShell>
  );
}
