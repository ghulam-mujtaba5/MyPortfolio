import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import Icon from "../Icon/Icon";
import styles from "./Dashboard.module.css";
import { formatDistanceToNow } from "date-fns";

const PinnedItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPinnedItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pinned-items");
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      } else {
        toast.error("Failed to fetch pinned items.");
      }
    } catch (error) {
      toast.error("An error occurred while fetching pinned items.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPinnedItems();
  }, []);

  const handleUnpin = async (id, type) => {
    try {
      const res = await fetch("/api/admin/pin-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to unpin");
      toast.success("Item unpinned");
      fetchPinnedItems(); // Refresh the list
    } catch (e) {
      toast.error(e.message || "Failed to unpin item");
    }
  };

  return (
    <div className={styles.widgetCard}>
      <h3 className={styles.widgetTitle}>Pinned Items</h3>
      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p className={styles.emptyText}>No items have been pinned yet.</p>
      ) : (
        <ul className={styles.itemList}>
          {items.map((item) => (
            <li key={`${item.type}-${item._id}`} className={styles.item}>
              <Link
                href={`/admin/${item.type}s/edit/${item._id}`}
                className={styles.itemLink}
              >
                <span className={styles.itemType}>{item.type}</span>
                <span className={styles.itemTitle}>{item.title}</span>
              </Link>
              <div className={styles.itemMeta}>
                <span className={styles.itemDate}>
                  {formatDistanceToNow(new Date(item.updatedAt), {
                    addSuffix: true,
                  })}
                </span>
                <button
                  onClick={() => handleUnpin(item._id, item.type)}
                  className={styles.unpinButton}
                >
                  <Icon name="pin" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PinnedItems;
