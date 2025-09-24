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

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (!res.ok) throw new Error("Failed to load admin stats");
        const json = await res.json();
        const payload = json.data || {};
        setStats(
          payload.stats || { projects: 0, articles: 0, users: 0, views: 0 },
        );
        setRecentActivity(payload.recentActivity || []);
        setViewStats(payload.viewStats || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast.error(error?.message || "Failed to load dashboard data");
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
        
        <motion.div
          className={`${commonStyles.widgetsGrid} ${themeStyles.widgetsGrid}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <StatWidget
              icon={<FaUsers />}
              title="Total Users"
              value={Number(stats.users || 0).toLocaleString()}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatWidget
              icon={<FaFileAlt />}
              title="Total Articles"
              value={Number(stats.articles || 0).toLocaleString()}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatWidget
              icon={<FaProjectDiagram />}
              title="Total Projects"
              value={Number(stats.projects || 0).toLocaleString()}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatWidget
              icon={<FaComments />}
              title="Total Views"
              value={Number(stats.views || 0).toLocaleString()}
            />
          </motion.div>

          <motion.div 
            className={`${commonStyles.chartArea} ${themeStyles.chartArea}`} 
            variants={itemVariants}
          >
            <ChartCard title="Page Views" hasData={hasChartData}>
              <SampleLineChart
                key={`pv-${chartLabels.join("|")}-${chartDataPoints.join("|")}`}
                labels={chartLabels}
                dataPoints={chartDataPoints}
                label="Page Views"
              />
            </ChartCard>
          </motion.div>

          <motion.div 
            className={`${commonStyles.fullWidthCard} ${themeStyles.fullWidthCard}`} 
            variants={itemVariants}
          >
            <div className={commonStyles.tableHeader}>
              <h2 className={`${commonStyles.sectionTitle} ${themeStyles.sectionTitle}`}>
                <FaClock style={{ color: "var(--primary)" }} />
                Recent Activity
              </h2>
              <div className={commonStyles.tableActions}>
                <button 
                  className="btn btn-sm btn-ghost"
                  style={{ 
                    padding: "0.25rem 0.5rem", 
                    fontSize: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem"
                  }}
                >
                  <FaUserCheck size={12} />
                  View All
                </button>
              </div>
            </div>
            <Table columns={activityColumns} data={recentActivity} />
          </motion.div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;