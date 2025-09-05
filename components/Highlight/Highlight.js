import React from "react";

// Simple text highlighter: splits by query and wraps matches in <mark>
export default function Highlight({ text = "", highlight = "" }) {
  const safeText = String(text);
  const query = String(highlight || "");
  if (!query) return <>{safeText}</>;

  try {
    const regex = new RegExp(`(${escapeRegExp(query)})`, "ig");
    const parts = safeText.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>,
        )}
      </>
    );
  } catch {
    // Fallback if regex fails
    return <>{safeText}</>;
  }
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
