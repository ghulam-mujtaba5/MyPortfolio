import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/Admin/AdminLayout/AdminLayout";
import Spinner from "../../components/Spinner/Spinner";
import utilities from "../../styles/utilities.module.css";
import { useTheme } from "../../context/ThemeContext";

const PinsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const { theme } = useTheme();

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
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = useMemo(() => {
    // Basic heuristic: we could track original order; for simplicity, require explicit Save click always enabled
    return true;
  }, [items]);

  return (
    <AdminLayout title="Pinned Items">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Pinned Items</h1>
        <div style={{ display: "flex", gap: 8 }}>
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
        <div style={{ display: "grid", gap: 12 }}>
          {items.length === 0 ? (
            <div>No pinned items yet. Pin articles or projects to manage order here.</div>
          ) : (
            items.map((it, idx) => (
              <div key={(it._id || it.id) + ":" + idx} style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto auto auto",
                alignItems: "center",
                gap: 12,
                padding: 12,
                border: "1px solid var(--border-color, #e5e7eb)",
                borderRadius: 8,
                background: theme === "dark" ? "#0b1220" : "#fff",
              }}>
                <div style={{ fontWeight: 600, minWidth: 28, textAlign: "right" }}>{idx + 1}</div>
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {it.title || it.name || it.slug || it._id}
                  </div>
                  <div style={{ opacity: 0.7, fontSize: 12 }}>
                    {it.type === "article" ? "Article" : "Project"} · {it.slug || it._id}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
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
                <div>
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
