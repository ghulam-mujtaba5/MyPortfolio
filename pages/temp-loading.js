import React, { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import to avoid SSR issues with window-related styles/behavior
const LoadingAnimation = dynamic(
  () => import("../components/LoadingAnimation/LoadingAnimation"),
  { ssr: false }
);

export default function TempLoadingPage() {
  // Fullscreen preview controls
  const [visible, setVisible] = useState(false); // start hidden so inline demo is usable
  const [showStars, setShowStars] = useState(true);
  const [backdropBlur, setBackdropBlur] = useState(5);
  const [backdropOpacity, setBackdropOpacity] = useState(0.8);
  const [size, setSize] = useState("md");

  // Inline demo states
  const [sectionLoading, setSectionLoading] = useState(true);
  const [saving, setSaving] = useState(true);
  const [rowLoading, setRowLoading] = useState(true);
  const [submitting, setSubmitting] = useState(true);

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 12 }}>Temp Loading Animation Preview</h1>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={() => setVisible((v) => !v)}>
          {visible ? "Hide" : "Show"} Loader
        </button>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <input type="checkbox" checked={showStars} onChange={(e) => setShowStars(e.target.checked)} />
          Show stars
        </label>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          Blur:
          <input
            type="range"
            min={0}
            max={12}
            step={1}
            value={backdropBlur}
            onChange={(e) => setBackdropBlur(Number(e.target.value))}
          />
          <span>{backdropBlur}px</span>
        </label>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          Backdrop Opacity:
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={backdropOpacity}
            onChange={(e) => setBackdropOpacity(Number(e.target.value))}
          />
          <span>{backdropOpacity}</span>
        </label>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          Size:
          <select value={size} onChange={(e) => setSize(e.target.value)}>
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
          </select>
        </label>
      </div>

      {/* Inline/minimal demos */}
      <section style={{ marginTop: 24 }}>
        <h2 style={{ margin: "16px 0 8px" }}>Inline + Ring Variants</h2>

        {/* quick toggles */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
          <button onClick={() => setSectionLoading((v) => !v)}>
            {sectionLoading ? "Show content" : "Show inline loader"}
          </button>
          <button onClick={() => setSaving((v) => !v)}>{saving ? "Stop saving" : "Start saving"}</button>
          <button onClick={() => setRowLoading((v) => !v)}>{rowLoading ? "Stop row load" : "Start row load"}</button>
          <button onClick={() => setSubmitting((v) => !v)}>{submitting ? "Stop submitting" : "Start submitting"}</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {/* Card/content section */}
          <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, minHeight: 120 }}>
            <h3 style={{ marginTop: 0 }}>Card/content section</h3>
            {sectionLoading ? (
              <div style={{ padding: 16, display: "flex", justifyContent: "center" }}>
                <LoadingAnimation
                  visible
                  fullscreen={false}
                  size="sm"
                  showStars={false}
                  message="Loading section..."
                />
              </div>
            ) : (
              <div>
                <p style={{ margin: 0 }}>Loaded content goes here.</p>
              </div>
            )}
          </div>

          {/* Ultra-compact (button) */}
          <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, minHeight: 120 }}>
            <h3 style={{ marginTop: 0 }}>Ultra-compact (button)</h3>
            <button className="btn" disabled={saving} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              {saving && (
                <span aria-hidden="true">
                  <LoadingAnimation visible fullscreen={false} variant="ring" sizePx={16} showStars={false} />
                </span>
              )}
              <span>{saving ? "Saving..." : "Save"}</span>
            </button>
          </div>

          {/* Table row cell */}
          <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, minHeight: 120 }}>
            <h3 style={{ marginTop: 0 }}>Table row cell</h3>
            <div style={{ display: "inline-block", minWidth: 48 }}>
              {rowLoading ? (
                <LoadingAnimation visible fullscreen={false} variant="ring" sizePx={14} showStars={false} />
              ) : (
                <span>42</span>
              )}
            </div>
          </div>

          {/* Form submit area */}
          <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, minHeight: 120 }}>
            <h3 style={{ marginTop: 0 }}>Form submit area</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button disabled={submitting}>{submitting ? "Submitting..." : "Submit"}</button>
              {submitting && (
                <LoadingAnimation visible fullscreen={false} variant="ring" sizePx={16} showStars={false} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mount the fullscreen loader at the end to ensure it overlays the page when toggled */}
      <LoadingAnimation
        visible={visible}
        showStars={showStars}
        backdropBlur={backdropBlur}
        backdropOpacity={backdropOpacity}
        size={size}
      />

      <p style={{ marginTop: 24 }}>
        Tip: Toggle visibility and tweak props to evaluate the animation behavior.
      </p>
    </div>
  );
}
