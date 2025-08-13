import Link from 'next/link';
import { useTheme } from '../../../context/ThemeContext';
import { FaPlus, FaPen, FaUserPlus, FaRocket } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useState } from 'react';

import commonStyles from './QuickActions.module.css';
import lightStyles from './QuickActions.light.module.css';
import darkStyles from './QuickActions.dark.module.css';

const ActionButton = ({ href, icon, label, themeStyles, onClick }) => {
  if (href) {
    return (
      <Link href={href} className={`${commonStyles.actionButton} ${themeStyles.actionButton}`}>
        {icon}
        <span>{label}</span>
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={`${commonStyles.actionButton} ${themeStyles.actionButton}`}>
      {icon}
      <span>{label}</span>
    </button>
  );
};


export default function QuickActions() {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
  const [isPublishing, setIsPublishing] = useState(false);

  const handleRunScheduler = async () => {
    setIsPublishing(true);
    const toastId = toast.loading('Checking for scheduled items to publish...');

    try {
      const response = await fetch('/api/admin/scheduler/publish', {
        method: 'POST',
        headers: {
          // In a real cron job, you'd use a secret key.
          // For this manual trigger, we rely on the user's session which is checked by the API route.
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to run scheduler.');
      }

      if (result.publishedCount > 0) {
        toast.success(`Successfully published ${result.publishedCount} item(s).`, { id: toastId });
      } else {
        toast.success('No items were scheduled for publishing.', { id: toastId });
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`, { id: toastId });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className={`${commonStyles.container} ${themeStyles.container}`}>
      <h2 className={`${commonStyles.title} ${themeStyles.title}`}>Quick Actions</h2>
      <div className={commonStyles.actionsGrid}>
        <ActionButton 
          href="/admin/articles/create"
          icon={<FaPlus />}
          label="New Article"
          themeStyles={themeStyles}
        />
        <ActionButton 
          href="/admin/projects/create"
          icon={<FaPen />}
          label="New Project"
          themeStyles={themeStyles}
        />
        <ActionButton 
          href="/admin/users/create"
          icon={<FaUserPlus />}
          label="New User"
          themeStyles={themeStyles}
        />
        <button onClick={handleRunScheduler} disabled={isPublishing} className={`${commonStyles.actionButton} ${themeStyles.actionButton}`}>
          <FaRocket />
          <span>{isPublishing ? 'Publishing...' : 'Run Scheduler'}</span>
        </button>
      </div>
    </div>
  );
}
