import Link from 'next/link';
import { useTheme } from '../../../context/ThemeContext';
import { FaPlus, FaPen, FaUserPlus } from 'react-icons/fa';

import commonStyles from './QuickActions.module.css';
import lightStyles from './QuickActions.light.module.css';
import darkStyles from './QuickActions.dark.module.css';

const ActionButton = ({ href, icon, label, themeStyles }) => (
  <Link href={href} className={`${commonStyles.actionButton} ${themeStyles.actionButton}`}>
    {icon}
    <span>{label}</span>
  </Link>
);

export default function QuickActions() {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

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
      </div>
    </div>
  );
}
