// pages/admin/dashboard.js
import AdminLayout from "../../components/Admin/AdminLayout/AdminLayout";
import toast from "react-hot-toast";
import StatWidget from "../../components/Admin/Dashboard/StatWidget";
import ChartCard from "../../components/Admin/Dashboard/ChartCard";
import SampleLineChart from "../../components/Admin/Charts/SampleLineChart";
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
  FaUserCheck,
} from "react-icons/fa";
import { formatDistanceToNow, format } from "date-fns";
import Head from "next/head";
import commonStyles from "./dashboard.module.css";
import lightStyles from "./dashboard.light.module.css";
import darkStyles from "./dashboard.dark.module.css";
import { useTheme } from "../../context/ThemeContext";
import InlineSpinner from "../../components/LoadingAnimation/InlineSpinner";
import Icon from "../../components/Admin/Icon/Icon";

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
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "0.75rem",
            }}
          >
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
          <div>
            <div style={{ fontWeight: 500 }}>{act}</div>
            {ent && (
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  marginTop: "0.125rem",
                }}
              >
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
        <div>
          <div>{formatDistanceToNow(new Date(row.createdAt), { addSuffix: true })}</div>
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              marginTop: "0.125rem",
            }}
          >
            {format(new Date(row.createdAt), "MMM d, yyyy h:mm a")}
          </div>
        </div>
      ),
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

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
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '200px' 
          }}>
            <InlineSpinner sizePx={32} />
          </div>
        ) : statsError ? (
          <div className={commonStyles.errorState}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>Unable to Load Dashboard Data</h3>
            <p style={{ color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
              {statsError.includes('Database connection') 
                ? 'Database connection failed. Please check your MongoDB Atlas IP whitelist settings.' 
                : statsError}
            </p>
            <div style={{ 
              backgroundColor: 'var(--bg-elev-2)', 
              padding: '1rem', 
              borderRadius: '0.5rem', 
              margin: '1rem 0',
              textAlign: 'left',
              fontSize: '0.875rem'
            }}>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Troubleshooting steps:</p>
              <ol style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>Check your MongoDB Atlas IP whitelist settings</li>
                <li>Ensure your MONGODB_URI in .env.local is correct</li>
                <li>Verify your internet connection</li>
                <li>Restart the development server</li>
              </ol>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.reload()}
              style={{ marginTop: '0.5rem' }}
            >
              Retry
            </button>
          </div>
        ) : (
          <motion.div
            className={commonStyles.widgetsGrid}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <div className={commonStyles.statWidgetCard}>
                <div className={commonStyles.statWidgetIcon}>
                  <FaUsers size={24} />
                </div>
                <div className={commonStyles.statWidgetTitle}>Total Users</div>
                <div className={commonStyles.statWidgetValue}>{Number(stats.users || 0).toLocaleString()}</div>
              </div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <div className={commonStyles.statWidgetCard}>
                <div className={commonStyles.statWidgetIcon}>
                  <FaFileAlt size={24} />
                </div>
                <div className={commonStyles.statWidgetTitle}>Total Articles</div>
                <div className={commonStyles.statWidgetValue}>{Number(stats.articles || 0).toLocaleString()}</div>
              </div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <div className={commonStyles.statWidgetCard}>
                <div className={commonStyles.statWidgetIcon}>
                  <FaProjectDiagram size={24} />
                </div>
                <div className={commonStyles.statWidgetTitle}>Total Projects</div>
                <div className={commonStyles.statWidgetValue}>{Number(stats.projects || 0).toLocaleString()}</div>
              </div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <div className={commonStyles.statWidgetCard}>
                <div className={commonStyles.statWidgetIcon}>
                  <FaComments size={24} />
                </div>
                <div className={commonStyles.statWidgetTitle}>Total Views</div>
                <div className={commonStyles.statWidgetValue}>{Number(stats.views || 0).toLocaleString()}</div>
              </div>
            </motion.div>

            <motion.div 
              className={commonStyles.chartArea} 
              variants={itemVariants}
            >
              <div className={commonStyles.chartCard}>
                <h2 className={commonStyles.chartHeader}>
                  <FaChartLine size={20} />
                  Page Views
                </h2>
                <div className={commonStyles.chartContainer}>
                  {hasChartData ? (
                    <SampleLineChart
                      key={`pv-${chartLabels.join("|")}-${chartDataPoints.join("|")}`}
                      labels={chartLabels}
                      dataPoints={chartDataPoints}
                      label="Page Views"
                    />
                  ) : (
                    <div className={commonStyles.emptyState}>
                      <Icon name="bar-chart" size={48} />
                      <p>No chart data available</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div 
              className={commonStyles.fullWidthCard} 
              variants={itemVariants}
            >
              <div className={commonStyles.tableCard}>
                <div className={commonStyles.tableHeader}>
                  <h2 className={commonStyles.tableHeader}>
                    <FaClock style={{ color: "var(--primary)" }} />
                    Recent Activity
                  </h2>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn btn-sm btn-ghost"
                      style={{ 
                        padding: "0.5rem 1rem", 
                        fontSize: "0.875rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        borderRadius: "var(--admin-btn-radius)",
                        border: "1px solid var(--border)",
                        background: "var(--bg-elev-1)",
                        color: "var(--text)"
                      }}
                    >
                      <FaUserCheck size={14} />
                      View All
                    </button>
                  </div>
                </div>
                <Table columns={activityColumns} data={recentActivity} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;