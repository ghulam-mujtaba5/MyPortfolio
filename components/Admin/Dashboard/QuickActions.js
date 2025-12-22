import Link from "next/link";
import { FaPlus, FaPen, FaUserPlus, FaRocket } from "react-icons/fa";
import toast from "react-hot-toast";
import { useState } from "react";
import styles from "./QuickActions.premium.module.css";

const ActionButton = ({ href, icon, label, onClick }) => {
  if (href) {
    return (
      <Link
        href={href}
        className={styles.actionButton}
      >
        {icon}
        <span>{label}</span>
      </Link>
    );
  }
  return (
    <button
      onClick={onClick}
      className={styles.actionButton}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default function QuickActions() {
  const [isPublishing, setIsPublishing] = useState(false);

  const handleRunScheduler = async () => {
    setIsPublishing(true);
    const toastId = toast.loading("Checking for scheduled items to publish...");

    try {
      const response = await fetch("/api/admin/scheduler/publish", {
        method: "POST",
        headers: {
          // In a real cron job, you'd use a secret key.
          // For this manual trigger, we rely on the user's session which is checked by the API route.
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to run scheduler.");
      }

      if (result.publishedCount > 0) {
        toast.success(
          `Successfully published ${result.publishedCount} item(s).`,
          { id: toastId },
        );
      } else {
        toast.success("No items were scheduled for publishing.", {
          id: toastId,
        });
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`, { id: toastId });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        Quick Actions
      </h2>
      <div className={styles.actionsGrid}>
        <ActionButton
          href="/admin/articles/new"
          icon={<FaPlus />}
          label="New Article"
        />
        <ActionButton
          href="/admin/projects/new"
          icon={<FaPen />}
          label="New Project"
        />
        <ActionButton
          href="/admin/users"
          icon={<FaUserPlus />}
          label="New User"
        />
        <button
          onClick={handleRunScheduler}
          disabled={isPublishing}
          className={styles.actionButton}
        >
          <FaRocket />
          <span>{isPublishing ? "Publishing..." : "Run Scheduler"}</span>
        </button>
      </div>
    </div>
  );
}
