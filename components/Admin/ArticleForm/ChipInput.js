import React, { useState } from "react";
import { useTheme } from "../../../context/ThemeContext";
import commonStyles from "./ArticleForm.module.css";
import lightStyles from "./ArticleForm.light.module.css";
import darkStyles from "./ArticleForm.dark.module.css";
import utilities from "../../../styles/utilities.module.css";

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
  const { theme } = useTheme();
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;
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
    <div className={commonStyles.chipContainer}>
      <div className={commonStyles.chipList}>
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
            className={`${commonStyles.chip} ${themeStyles.chip}`}
          >
            <span className={commonStyles.chipTextSm}>
              {quoted ? `“${item}”` : item}
            </span>
            {reorderable && (
              <span className={commonStyles.chipMoveGroup}>
                <button
                  type="button"
                  title="Move left"
                  aria-label={`Move ${quoted ? "highlight" : "item"} left`}
                  onClick={() => moveItem(idx, idx - 1)}
                  className={`${commonStyles.chipMoveBtn} ${themeStyles.chipMoveBtn}`}
                >
                  ←
                </button>
                <button
                  type="button"
                  title="Move right"
                  aria-label={`Move ${quoted ? "highlight" : "item"} right`}
                  onClick={() => moveItem(idx, idx + 1)}
                  className={`${commonStyles.chipMoveBtn} ${themeStyles.chipMoveBtn}`}
                >
                  →
                </button>
              </span>
            )}
            <button
              type="button"
              aria-label={`Remove ${quoted ? "highlight" : "item"}: ${item}`}
              onClick={() => removeItem(item)}
              className={`${commonStyles.chipRemoveBtn} ${themeStyles.chipRemoveBtn}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className={commonStyles.chipInputRow}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label={ariaLabel}
          className={`${commonStyles.chipInput} ${themeStyles.chipInput}`}
        />
        <button
          type="button"
          onClick={() => addItem(input)}
          className={`${utilities.btn} ${utilities.btnSecondary}`}
          aria-label={ariaLabel}
        >
          {addButtonLabel}
        </button>
      </div>
    </div>
  );
}
