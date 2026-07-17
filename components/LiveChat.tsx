"use client";

import { useEffect, useState } from "react";
import { findShipment, formatEventDate } from "@/lib/shipments";

type ChatMessage = { from: "bot" | "user"; content: React.ReactNode };

export default function LiveChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mode, setMode] = useState<"idle" | "awaiting-tracking">("idle");
  const [trackingInput, setTrackingInput] = useState("");

  // Escape closes the panel, mirrors MobileNav's listener-in-effect structure.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function toggleOpen() {
    setOpen((v) => !v);
    setMessages((prev) =>
      prev.length === 0 ? [{ from: "bot", content: "Hi! How can I help you today?" }] : prev
    );
  }

  function handleChipClick() {
    setMessages((prev) => [
      ...prev,
      { from: "user", content: "Where is my order?" },
      { from: "bot", content: "Sure — what's your tracking number?" },
    ]);
    setMode("awaiting-tracking");
  }

  function handleSubmitTracking() {
    const value = trackingInput.trim();
    if (!value) return;

    const shipment = findShipment(value);
    const userMsg: ChatMessage = { from: "user", content: value };
    const botMsg: ChatMessage = shipment
      ? {
          from: "bot",
          content: (
            <>
              <strong>{shipment.tracking}</strong> — {shipment.events[0].title},{" "}
              {formatEventDate(shipment.events[0].date)} at {shipment.events[0].time}. Destination:{" "}
              {shipment.destination}.
              <br />
              <a href={`/track?number=${shipment.tracking}`}>View full tracking →</a>
            </>
          ),
        }
      : {
          from: "bot",
          content: (
            <>
              Couldn&apos;t find a shipment for <strong>{value}</strong>. Double-check the number, or{" "}
              <a href="/contact-us">contact us</a>.
            </>
          ),
        };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setTrackingInput("");
    setMode("idle");
  }

  const showChip = mode === "idle";

  return (
    <>
      <button
        type="button"
        className="hifi-chat-launcher"
        aria-label={open ? "Close live chat" : "Open live chat"}
        onClick={toggleOpen}
      >
        {open ? (
          <span aria-hidden="true">&times;</span>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M4 4h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"
              fill="currentColor"
            />
          </svg>
        )}
      </button>
      {open && (
        <div className="hifi-chat-backdrop" onClick={() => setOpen(false)}>
          <div className="hifi-chat-panel" role="dialog" aria-label="Live chat" onClick={(e) => e.stopPropagation()}>
            <div className="hifi-chat-header">
              <span>Customer Support</span>
              <button
                type="button"
                className="hifi-chat-close"
                aria-label="Close live chat"
                onClick={() => setOpen(false)}
              >
                &times;
              </button>
            </div>
            <div className="hifi-chat-log" aria-live="polite">
              {messages.map((m, i) => (
                <div key={i} className={`hifi-chat-msg from-${m.from}`}>
                  {m.content}
                </div>
              ))}
            </div>
            {showChip && (
              <button type="button" className="hifi-chat-chip" onClick={handleChipClick}>
                Where is my order?
              </button>
            )}
            {mode === "awaiting-tracking" && (
              <div className="hifi-chat-input-row">
                <input
                  type="text"
                  placeholder="e.g CRG-11-4821"
                  aria-label="Tracking number"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSubmitTracking();
                    }
                  }}
                />
                <button type="button" onClick={handleSubmitTracking}>
                  Send
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
