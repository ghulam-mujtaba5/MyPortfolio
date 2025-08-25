import { useEffect, useMemo, useRef, useState } from "react";
import AdminLayout from "../../components/Admin/AdminLayout/AdminLayout";
import Spinner from "../../components/Spinner/Spinner";
import utilities from "../../styles/utilities.module.css";
import { useTheme } from "../../context/ThemeContext";
import toast from "react-hot-toast";
import styles from "./pins.module.css";

const PinsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const { theme } = useTheme();
  const dragFromIndexRef = useRef(null);
  const [draggingIndex, setDraggingIndex] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/pinned-items");
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to load");
      setItems(json.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const move = (index, dir) => {
    setItems((prev) => {
      const arr = [...prev];
      const target = index + dir;
      if (target < 0 || target >= arr.length) return prev;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
  };

  // Drag and Drop Handlers (HTML5, accessible-friendly)
  const onDragStart = (idx) => (e) => {
    dragFromIndexRef.current = idx;
    setDraggingIndex(idx);
    e.dataTransfer.effectAllowed = "move";
    // For Firefox compatibility
    e.dataTransfer.setData("text/plain", String(idx));
  };

  const onDragOver = (idx) => (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = (idx) => (e) => {
    e.preventDefault();
    const from = dragFromIndexRef.current;
    if (from == null || from === idx) return;
    setItems((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(from, 1);
      arr.splice(idx, 0, moved);
      return arr;
    });
    dragFromIndexRef.current = null;
    setDraggingIndex(null);
  };

  const onDragEnd = () => {
    dragFromIndexRef.current = null;
    setDraggingIndex(null);
  };

  const unpin = async (id, type) => {
    try {
      const res = await fetch("/api/admin/pin-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to toggle pin");
      // Reload after toggle so the list is fresh and limited correctly
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  const saveOrder = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = items.map((it) => ({ id: it._id || it.id, type: it.type }));
      const res = await fetch("/api/admin/reorder-pins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payload }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to save order");
      toast.success("Pinned order saved");
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = true; // Save button logic kept simple; always enabled unless disabled by other state

  return (
    <AdminLayout title="Pinned Items">
      <div className={styles.headerWrap}>
        <h1 style={{ margin: 0 }}>Pinned Items</h1>
        <div className={styles.headerActions}>
          <button
            type="button"
            onClick={load}
            className={`${utilities.btn} ${utilities.btnSecondary}`}
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={saveOrder}
            disabled={saving || loading || items.length === 0 || !hasChanges}
            className={`${utilities.btn} ${utilities.btnPrimary}`}
          >
            {saving ? "Saving..." : "Save Order"}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 24, display: "flex", alignItems: "center", gap: 12 }}>
          <Spinner size="lg" label="Loading pinned items" />
        </div>
      ) : error ? (
        <div style={{ color: "#dc2626" }}>Error: {error}</div>
      ) : (
        <div role="list" aria-label="Pinned items" className={styles.list}>
          {items.length === 0 ? (
            <div>No pinned items yet. Pin articles or projects to manage order here.</div>
          ) : (
            items.map((it, idx) => (
              <div
                key={(it._id || it.id) + ":" + idx}
                role="listitem"
                draggable
                onDragStart={onDragStart(idx)}
                onDragOver={onDragOver(idx)}
                onDrop={onDrop(idx)}
                onDragEnd={onDragEnd}
                aria-grabbed={draggingIndex === idx}
                aria-dropeffect="move"
                className={styles.itemRow}
                style={{
                  outline:
                    draggingIndex === idx
                      ? "2px dashed var(--color-primary, #2563eb)"
                      : "none",
                  opacity: draggingIndex === idx ? 0.85 : 1,
                  cursor: "grab",
                  background: theme === "dark" ? "#0b1220" : undefined,
                }}
              >
                <div className={styles.itemIndex}>{idx + 1}</div>
                <div className={styles.itemTitleWrap}>
                  <div className={styles.itemTitle}>
                    {it.title || it.name || it.slug || it._id}
                  </div>
                  <div className={styles.itemMeta}>
                    {it.type === "article" ? "Article" : "Project"} · {it.slug || it._id}
                  </div>
                </div>
                <div className={styles.itemMoveGroup}>
                  <button
                    type="button"
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    className={`${utilities.btn} ${utilities.btnSecondary}`}
                    title="Move up"
                  >↑</button>
                  <button
                    type="button"
                    onClick={() => move(idx, 1)}
                    disabled={idx === items.length - 1}
                    className={`${utilities.btn} ${utilities.btnSecondary}`}
                    title="Move down"
                  >↓</button>
                </div>
                <div className={styles.itemUnpin}>
                  <button
                    type="button"
                    onClick={() => unpin(it._id || it.id, it.type)}
                    className={`${utilities.btn} ${utilities.btnDanger || utilities.btnSecondary}`}
                    title="Unpin"
                  >
                    Unpin
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default PinsPage;
