import Link from 'next/link';
import { useTheme } from '../../../context/ThemeContext';
import commonStyles from './Dashboard.module.css';
import lightStyles from './Dashboard.light.module.css';
import darkStyles from './Dashboard.dark.module.css';

const Dashboard = ({ stats, recentActivity }) => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  // Default values to prevent errors if props are undefined
  const safeStats = stats || { articles: 0, projects: 0 };
  const safeRecentActivity = recentActivity || [];

  return (
    <div className={commonStyles.dashboard}>
      <h1 className={commonStyles.title}>Dashboard</h1>
      
      <div className={commonStyles.statsGrid}>
        <div className={`${commonStyles.statCard} ${themeStyles.statCard}`}>
          <h3>Total Articles</h3>
          <p>{safeStats.articles}</p>
        </div>
        <div className={`${commonStyles.statCard} ${themeStyles.statCard}`}>
          <h3>Total Projects</h3>
          <p>{safeStats.projects}</p>
        </div>
      </div>

      <div className={commonStyles.bottomGrid}>
        <div className={`${commonStyles.recentActivity} ${themeStyles.recentActivity}`}>
          <h2>Recent Activity</h2>
          <ul>
            {safeRecentActivity.map(item => (
              <li key={item._id}>
                <span>{item.title}</span>
                <small>{new Date(item.updatedAt).toLocaleDateString()}</small>
              </li>
            ))}
          </ul>
        </div>

        <div className={`${commonStyles.quickActions} ${themeStyles.quickActions}`}>
          <h2>Quick Actions</h2>
          <Link href="/admin/articles/new" passHref>
            <button className={`${commonStyles.quickButton} ${themeStyles.button}`}>New Article</button>
          </Link>
          <Link href="/admin/projects/new" passHref>
            <button className={`${commonStyles.quickButton} ${themeStyles.button}`}>New Project</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
