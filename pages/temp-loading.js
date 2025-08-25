import React, { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import to avoid SSR issues with window-related styles/behavior
const LoadingAnimation = dynamic(
  () => import("../components/LoadingAnimation/LoadingAnimation"),
  { ssr: false }
);

export default function TempLoadingPage() {
  const [visible, setVisible] = useState(true);
  const [showStars, setShowStars] = useState(true);
  const [backdropBlur, setBackdropBlur] = useState(5);
  const [backdropOpacity, setBackdropOpacity] = useState(0.8);
  const [size, setSize] = useState("md");

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

      {/* Mount the loader at the end to ensure it overlays the page */}
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
