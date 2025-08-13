import { useState, useEffect } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { formatDistanceToNow } from "date-fns";

import commonStyles from "./RecentActivity.module.css";
import lightStyles from "./RecentActivity.light.module.css";
import darkStyles from "./RecentActivity.dark.module.css";

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
  return <span className={commonStyles.icon}>{icons[action] || "⚙️"}</span>;
};

export default function RecentActivity() {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;

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
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);

  if (loading) {
    return (
      <div className={`${commonStyles.container} ${themeStyles.container}`}>
        Loading activity...
      </div>
    );
  }

  return (
    <div className={`${commonStyles.container} ${themeStyles.container}`}>
      <h2 className={`${commonStyles.title} ${themeStyles.title}`}>
        Recent Activity
      </h2>
      <ul className={commonStyles.activityList}>
        {activity.map((log) => (
          <li
            key={log._id}
            className={`${commonStyles.activityItem} ${themeStyles.activityItem}`}
          >
            <ActionIcon action={log.action} />
            <div className={commonStyles.activityDetails}>
              <p className={commonStyles.activityText}>
                <strong>{log.userName}</strong> {log.action.replace("_", " ")}d
                a(n) <strong>{log.entity}</strong>.
              </p>
              <p
                className={`${commonStyles.activityTime} ${themeStyles.activityTime}`}
              >
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
