import React, { useState } from "react";
import commonStyles from "./ArticleForm.module.css";

// Generic chip-style CSV editor used for tags, categories, and highlights.
export default function ChipInput({
  value,
  onChange,
  placeholder = "Add item and press Enter",
  ariaLabel = "Add item",
  addButtonLabel = "Add",
  quoted = false,
  reorderable = false,
}) {
  const [input, setInput] = useState("");
  const toArray = (csv) =>
    String(csv || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  const toCsv = (arr) => arr.join(", ");
  const items = toArray(value);

  const addItem = (text) => {
    const t = text.trim();
    if (!t) return;
    if (items.includes(t)) return;
    onChange(toCsv([...items, t]));
    setInput("");
  };

  const removeItem = (text) => {
    const next = items.filter((i) => i !== text);
    onChange(toCsv(next));
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addItem(input);
    } else if (e.key === "Backspace" && !input && items.length > 0) {
      removeItem(items[items.length - 1]);
    }
  };

  const moveItem = (from, to) => {
    if (!reorderable) return;
    if (to < 0 || to >= items.length) return;
    const next = items.slice();
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    onChange(toCsv(next));
  };

  const handleDragStart = (e, index) => {
    if (!reorderable) return;
    e.dataTransfer.setData("text/plain", String(index));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    if (!reorderable) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, toIndex) => {
    if (!reorderable) return;
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (!Number.isNaN(fromIndex) && fromIndex !== toIndex) {
      moveItem(fromIndex, toIndex);
    }
  };

  return (
    <div style={{ marginTop: 6 }}>
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}
      >
        {items.map((item, idx) => (
          <span
            key={item}
            draggable={reorderable}
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, idx)}
            onKeyDown={(e) => {
              if (!reorderable) return;
              if (e.altKey && (e.key === "ArrowLeft" || e.key === "ArrowUp")) {
                e.preventDefault();
                moveItem(idx, idx - 1);
              }
              if (
                e.altKey &&
                (e.key === "ArrowRight" || e.key === "ArrowDown")
              ) {
                e.preventDefault();
                moveItem(idx, idx + 1);
              }
            }}
            tabIndex={reorderable ? 0 : -1}
            aria-label={
              reorderable
                ? `${quoted ? "Highlight" : "Item"} ${idx + 1} of ${items.length}. Alt+Arrow keys to reorder.`
                : undefined
            }
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "2px 8px",
              border: "1px solid #e5e7eb",
              borderRadius: 999,
              background: "#f9fafb",
            }}
          >
            <span style={{ fontSize: "0.85rem" }}>
              {quoted ? `“${item}”` : item}
            </span>
            {reorderable && (
              <span style={{ display: "inline-flex", gap: 4 }}>
                <button
                  type="button"
                  title="Move left"
                  aria-label={`Move ${quoted ? "highlight" : "item"} left`}
                  onClick={() => moveItem(idx, idx - 1)}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    border: "1px solid #e5e7eb",
                    background: "white",
                    cursor: "pointer",
                  }}
                >
                  ←
                </button>
                <button
                  type="button"
                  title="Move right"
                  aria-label={`Move ${quoted ? "highlight" : "item"} right`}
                  onClick={() => moveItem(idx, idx + 1)}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    border: "1px solid #e5e7eb",
                    background: "white",
                    cursor: "pointer",
                  }}
                >
                  →
                </button>
              </span>
            )}
            <button
              type="button"
              aria-label={`Remove ${quoted ? "highlight" : "item"}: ${item}`}
              onClick={() => removeItem(item)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 20,
                height: 20,
                borderRadius: 999,
                border: "1px solid #e5e7eb",
                background: "white",
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label={ariaLabel}
          style={{
            padding: "0.4rem 0.6rem",
            border: "1px solid #d1d5db",
            borderRadius: 8,
            fontSize: "0.9rem",
            flex: "0 1 360px",
          }}
        />
        <button
          type="button"
          onClick={() => addItem(input)}
          className={commonStyles.button}
          aria-label={ariaLabel}
        >
          {addButtonLabel}
        </button>
      </div>
    </div>
  );
}
