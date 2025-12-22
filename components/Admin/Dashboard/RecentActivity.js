import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import styles from "./RecentActivity.premium.module.css";

// A simple icon component for different actions
const ActionIcon = ({ action }) => {
  const icons = {
    create: "➕",
    update: "✏️",
    delete: "🗑️",
    login_success: "✅",
    bulk_delete: "🗑️🗑️",
    login_fail: "❌",
  };
  return <span className={styles.icon}>{icons[action] || "⚙️"}</span>;
};

export default function RecentActivity() {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await fetch("/api/admin/activity");
        if (res.ok) {
          const data = await res.json();
          setActivity(data);
        }
      } catch (error) {
        console.error("Failed to fetch recent activity:", error);
        toast.error(error?.message || "Failed to load recent activity");
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        Loading activity...
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        Recent Activity
      </h2>
      <ul className={styles.activityList}>
        {activity.map((log) => (
          <li
            key={log._id}
            className={styles.activityItem}
          >
            <ActionIcon action={log.action} />
            <div className={styles.activityDetails}>
              <p className={styles.activityText}>
                <strong>{log.userName}</strong> {log.action.replace("_", " ")}d
                a(n) <strong>{log.entity}</strong>.
              </p>
              <p className={styles.activityTime}>
                {formatDistanceToNow(new Date(log.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
