import React from "react";

export default function PreviewBanner() {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "#fde68a",
        color: "#78350f",
        padding: "8px 12px",
        textAlign: "center",
        borderBottom: "1px solid #f59e0b",
      }}
      role="status"
      aria-live="polite"
    >
      You are viewing a preview. Content may change.
    </div>
  );
}
