import shipmentsRaw from "@/mockdata/shipments.json";

// Seed shipment data for Track & Trace. Same shape as the rest of mockdata/:
// this module is the only thing that knows where shipments come from, so
// swapping it for a carrier API later is a one-file change.

export type ShipmentEvent = {
  date: string;
  time: string;
  title: string;
  location: string;
};

export type Shipment = {
  tracking: string;
  service: string;
  destination: string;
  /** Newest first — events[0] is the shipment's current status. */
  events: ShipmentEvent[];
};

const SHIPMENTS: Shipment[] = shipmentsRaw;

/** Case- and whitespace-insensitive; users paste numbers with stray spacing. */
export function findShipment(tracking: string): Shipment | undefined {
  const key = tracking.trim().toUpperCase();
  if (!key) return undefined;
  return SHIPMENTS.find((s) => s.tracking.toUpperCase() === key);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Formatted from the ISO parts rather than via Date/Intl on purpose: `new
// Date("2026-07-14")` parses as UTC midnight, so rendering it in a negative-offset
// timezone would show Jul 13. These are calendar dates, not instants.
//
// Falls back to the raw string on anything unexpected. The seed data is ours and
// well-formed, but this is the boundary a real carrier API will arrive through,
// and a bad date should degrade to "2026-13-14" rather than "undefined 14, 2026".
//
// Showing the raw value is deliberate, not laziness: the regex checks *shape*, and
// the MONTHS lookup catches out-of-range months (13+ -> undefined -> raw). Rendering
// the source string keeps a malformed date debuggable in the UI and greppable in a
// bug report; silently dropping the row would hide a broken feed instead. If a real
// backend lands, validate at the fetch boundary and let this stay a formatter.
export function formatEventDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const month = MONTHS[Number(m[2]) - 1];
  return month ? `${month} ${m[3]}, ${m[1]}` : iso;
}
