// pages/admin/dashboard.js
import AdminLayout from "../../components/Admin/AdminLayout/AdminLayout";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Table from "../../components/Admin/Table/Table";
import {
  FaUsers,
  FaFileAlt,
  FaProjectDiagram,
  FaComments,
  FaChartLine,
  FaClock,
} from "react-icons/fa";
import { formatDistanceToNow, format } from "date-fns";
import Head from "next/head";
import commonStyles from "./dashboard.module.css";
import lightStyles from "./dashboard.light.module.css";
import darkStyles from "./dashboard.dark.module.css";
import { useTheme } from "../../context/ThemeContext";
import InlineSpinner from "../../components/LoadingAnimation/InlineSpinner";
import Icon from "../../components/Admin/Icon/Icon";
import SampleLineChart from "../../components/Admin/Charts/SampleLineChart";

const AdminDashboard = () => {
  const [recentActivity, setRecentActivity] = useState([]);
  const [stats, setStats] = useState({
    projects: 0,
    articles: 0,
    users: 0,
    views: 0,
  });
  const [viewStats, setViewStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        setStatsError(null);
        const res = await fetch("/api/admin/stats");
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData?.message || `Failed to load admin stats (${res.status})`);
        }
        const json = await res.json();
        const payload = json.data || {};
        setStats(
          payload.stats || { projects: 0, articles: 0, users: 0, views: 0 },
        );
        setRecentActivity(payload.recentActivity || []);
        setViewStats(payload.viewStats || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setStatsError(error.message);
        toast.error(error?.message || "Failed to load dashboard data. Please check your database connection and try again.");
        // Set default values to prevent UI breakage
        setStats({ projects: 0, articles: 0, users: 0, views: 0 });
        setRecentActivity([]);
        setViewStats([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const activityColumns = [
    {
      header: "User",
      key: "user",
      render: (row) => (
        <div className={commonStyles.userCell}>
          <div className={commonStyles.userAvatar}>
            {row.user?.name?.charAt(0) || row.userName?.charAt(0) || "U"}
          </div>
          <span>{row.user?.name || row.userName || "—"}</span>
        </div>
      ),
    },
    {
      header: "Action",
      key: "action",
      render: (row) => {
        const act = (row.action || "").replace(/_/g, " ");
        const ent = row.entity || row.entityType || "";
        return (
          <div className={commonStyles.actionCell}>
            <div className={commonStyles.actionText}>{act}</div>
            {ent && (
              <div className={commonStyles.entityText}>
                {ent}
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: "Timestamp",
      key: "createdAt",
      render: (row) => (
        <div className={commonStyles.timestampCell}>
          <div>{formatDistanceToNow(new Date(row.createdAt), { addSuffix: true })}</div>
          <div className={commonStyles.timestampDetail}>
            {format(new Date(row.createdAt), "MMM d, yyyy h:mm a")}
          </div>
        </div>
      ),
    },
  ];

  // Prepare chart data from viewStats (DailyStat[] with { date, views })
  const chartLabels = Array.isArray(viewStats)
    ? viewStats.map((d, i) => {
        const dt = d?.date ? new Date(d.date) : null;
        return dt && !isNaN(dt)
          ? dt.toLocaleDateString(undefined, { month: "short", day: "numeric" })
          : `#${i + 1}`;
      })
    : [];
  const chartDataPoints = Array.isArray(viewStats)
    ? viewStats.map((d) => {
        const n = Number(d?.views);
        return Number.isFinite(n) ? n : 0;
      })
    : [];
  const hasChartData =
    chartLabels.length > 0 && chartLabels.length === chartDataPoints.length;

  const { theme } = useTheme();
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;

  return (
    <AdminLayout>
      <Head>
        <title>Admin Dashboard - My Portfolio</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <div className={`${commonStyles.dashboardContainer} ${themeStyles.dashboardContainer}`}>
        <motion.header 
          className={`${commonStyles.header} ${themeStyles.header}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>Dashboard</h1>
          <p>Welcome back, Admin! Here's what's happening with your portfolio today.</p>
        </motion.header>
        
        {isLoading ? (
          <div className={commonStyles.loadingContainer}>
            <InlineSpinner sizePx={32} />
            <span>Loading dashboard data...</span>
          </div>
        ) : statsError ? (
          <div className={commonStyles.errorState}>
            <div className={commonStyles.errorIcon}>⚠️</div>
            <h3 className={commonStyles.errorTitle}>Unable to Load Dashboard Data</h3>
            <p className={commonStyles.errorMessage}>
              {statsError.includes('Database connection') 
                ? 'Database connection failed. Please check your MongoDB Atlas IP whitelist settings.' 
                : statsError}
            </p>
            <div className={commonStyles.errorDetails}>
              <p className={commonStyles.errorDetailsTitle}>Troubleshooting steps:</p>
              <ol className={commonStyles.errorSteps}>
                <li>Check your MongoDB Atlas IP whitelist settings</li>
                <li>Ensure your MONGODB_URI in .env.local is correct</li>
                <li>Verify your internet connection</li>
                <li>Restart the development server</li>
              </ol>
            </div>
            <button 
              className={`${commonStyles.retryButton} ${themeStyles.retryButton}`}
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Stats Overview Section */}
            <motion.section
              className={commonStyles.section}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className={commonStyles.sectionHeader}>
                <h2 className={commonStyles.sectionTitle}>
                  <Icon name="bar-chart-2" size={20} />
                  Statistics Overview
                </h2>
              </div>
              
              <div className={commonStyles.statsGrid}>
                <motion.div 
                  className={`${commonStyles.statCard} ${themeStyles.statCard}`}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <div className={commonStyles.statIconWrapper}>
                    <div className={`${commonStyles.statIcon} ${commonStyles.usersIcon}`}>
                      <FaUsers size={20} />
                    </div>
                  </div>
                  <div className={commonStyles.statContent}>
                    <h3 className={commonStyles.statLabel}>Total Users</h3>
                    <p className={commonStyles.statValue}>{Number(stats.users || 0).toLocaleString()}</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className={`${commonStyles.statCard} ${themeStyles.statCard}`}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <div className={commonStyles.statIconWrapper}>
                    <div className={`${commonStyles.statIcon} ${commonStyles.articlesIcon}`}>
                      <FaFileAlt size={20} />
                    </div>
                  </div>
                  <div className={commonStyles.statContent}>
                    <h3 className={commonStyles.statLabel}>Total Articles</h3>
                    <p className={commonStyles.statValue}>{Number(stats.articles || 0).toLocaleString()}</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className={`${commonStyles.statCard} ${themeStyles.statCard}`}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <div className={commonStyles.statIconWrapper}>
                    <div className={`${commonStyles.statIcon} ${commonStyles.projectsIcon}`}>
                      <FaProjectDiagram size={20} />
                    </div>
                  </div>
                  <div className={commonStyles.statContent}>
                    <h3 className={commonStyles.statLabel}>Total Projects</h3>
                    <p className={commonStyles.statValue}>{Number(stats.projects || 0).toLocaleString()}</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className={`${commonStyles.statCard} ${themeStyles.statCard}`}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <div className={commonStyles.statIconWrapper}>
                    <div className={`${commonStyles.statIcon} ${commonStyles.viewsIcon}`}>
                      <FaComments size={20} />
                    </div>
                  </div>
                  <div className={commonStyles.statContent}>
                    <h3 className={commonStyles.statLabel}>Total Views</h3>
                    <p className={commonStyles.statValue}>{Number(stats.views || 0).toLocaleString()}</p>
                  </div>
                </motion.div>
              </div>
            </motion.section>

            {/* Analytics Section */}
            <motion.section
              className={commonStyles.section}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className={commonStyles.sectionHeader}>
                <h2 className={commonStyles.sectionTitle}>
                  <Icon name="activity" size={20} />
                  Analytics & Trends
                </h2>
              </div>
              
              <motion.div 
                className={`${commonStyles.chartCard} ${themeStyles.chartCard}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className={commonStyles.chartHeader}>
                  <h3 className={commonStyles.chartTitle}>
                    <FaChartLine size={18} />
                    Page Views
                  </h3>
                </div>
                <div className={commonStyles.chartContainer}>
                  {hasChartData ? (
                    <SampleLineChart
                      key={`pv-${chartLabels.join("|")}-${chartDataPoints.join("|")}`}
                      labels={chartLabels}
                      dataPoints={chartDataPoints}
                      label="Page Views"
                    />
                  ) : (
                    <div className={commonStyles.emptyChartState}>
                      <Icon name="bar-chart" size={48} />
                      <p>No chart data available</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.section>

            {/* Recent Activity Section */}
            <motion.section
              className={commonStyles.section}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className={commonStyles.sectionHeader}>
                <h2 className={commonStyles.sectionTitle}>
                  <Icon name="clock" size={20} />
                  Recent Activity
                </h2>
              </div>
              
              <motion.div 
                className={`${commonStyles.activityCard} ${themeStyles.activityCard}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Table columns={activityColumns} data={recentActivity} />
              </motion.div>
            </motion.section>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;