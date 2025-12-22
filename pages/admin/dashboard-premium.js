/**
 * Enhanced Admin Dashboard - Premium Version
 * Features: KPI cards with sparklines, progress rings, modern animations
 */
import AdminLayout from "../../components/Admin/AdminLayout/AdminLayout";
import toast from "react-hot-toast";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Table from "../../components/Admin/Table/Table";
import { formatDistanceToNow, format } from "date-fns";
import Head from "next/head";
import Link from "next/link";
import styles from "./dashboard.premium.module.css";
import { useTheme } from "../../context/ThemeContext";
import InlineSpinner from "../../components/LoadingAnimation/InlineSpinner";
import { Sparkline, ProgressRing } from "../../components/Admin/Charts";
import SampleLineChart from "../../components/Admin/Charts/SampleLineChart";

// Icon components for cleaner code
const Icons = {
  Users: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Articles: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14,2 14,8 20,8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10,9 9,9 8,9"/>
    </svg>
  ),
  Projects: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      <line x1="12" y1="11" x2="12" y2="17"/>
      <line x1="9" y1="14" x2="15" y2="14"/>
    </svg>
  ),
  Views: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  TrendUp: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  TrendDown: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
      <polyline points="17 18 23 18 23 12"/>
    </svg>
  ),
  Activity: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  Chart: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  Clock: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  RefreshCw: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/>
      <polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  ),
  AlertTriangle: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
};

// Animation variants
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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

const AdminDashboard = () => {
  const { theme } = useTheme();
  const [recentActivity, setRecentActivity] = useState([]);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [stats, setStats] = useState({
    projects: 0,
    articles: 0,
    users: 0,
    views: 0,
  });
  const [viewStats, setViewStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
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
      setStatsError(null);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setStatsError(error.message);
      toast.error(error?.message || "Failed to load dashboard data.");
      setStats({ projects: 0, articles: 0, users: 0, views: 0 });
      setRecentActivity([]);
      setViewStats([]);
    }
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await fetchDashboard();
      setIsLoading(false);
    };
    load();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
    toast.success("Dashboard refreshed!");
  };

  // Generate mock trend data for sparklines (in production, use real historical data)
  const generateTrendData = (currentValue, variance = 0.2) => {
    const data = [];
    for (let i = 0; i < 7; i++) {
      const randomFactor = 1 + (Math.random() - 0.5) * variance;
      data.push(Math.round(currentValue * randomFactor * (0.7 + i * 0.05)));
    }
    return data;
  };

  // KPI card configurations
  const kpiCards = useMemo(() => [
    {
      id: "users",
      title: "Total Users",
      value: stats.users,
      icon: Icons.Users,
      variant: "primary",
      trend: { value: 12, direction: "up" },
      sparklineData: generateTrendData(stats.users),
      progress: Math.min((stats.users / 100) * 100, 100),
    },
    {
      id: "articles",
      title: "Total Articles",
      value: stats.articles,
      icon: Icons.Articles,
      variant: "success",
      trend: { value: 8, direction: "up" },
      sparklineData: generateTrendData(stats.articles),
      progress: Math.min((stats.articles / 50) * 100, 100),
    },
    {
      id: "projects",
      title: "Total Projects",
      value: stats.projects,
      icon: Icons.Projects,
      variant: "warning",
      trend: { value: 5, direction: "up" },
      sparklineData: generateTrendData(stats.projects),
      progress: Math.min((stats.projects / 30) * 100, 100),
    },
    {
      id: "views",
      title: "Total Views",
      value: stats.views,
      icon: Icons.Views,
      variant: "error",
      trend: { value: 24, direction: "up" },
      sparklineData: generateTrendData(stats.views),
      progress: Math.min((stats.views / 10000) * 100, 100),
    },
  ], [stats]);

  // Table columns for activity
  const activityColumns = [
    {
      header: "User",
      key: "user",
      render: (row) => (
        <div className={styles.userCell}>
          <div className={styles.userAvatar}>
            {row.user?.name?.charAt(0) || row.userName?.charAt(0) || "U"}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{row.user?.name || row.userName || "Unknown"}</span>
            <span className={styles.userEmail}>{row.user?.email || ""}</span>
          </div>
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
          <div className={styles.actionCell}>
            <span className={styles.actionBadge}>{act}</span>
            {ent && <span className={styles.entityType}>{ent}</span>}
          </div>
        );
      },
    },
    {
      header: "Timestamp",
      key: "createdAt",
      render: (row) => (
        <div className={styles.timestampCell}>
          <span className={styles.timeAgo}>
            {formatDistanceToNow(new Date(row.createdAt), { addSuffix: true })}
          </span>
          <span className={styles.timeExact}>
            {format(new Date(row.createdAt), "MMM d, h:mm a")}
          </span>
        </div>
      ),
    },
  ];

  // Chart data
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
  const hasChartData = chartLabels.length > 0 && chartLabels.length === chartDataPoints.length;

  const activityRows = useMemo(() => {
    if (!Array.isArray(recentActivity)) return [];
    return showAllActivity ? recentActivity : recentActivity.slice(0, 8);
  }, [recentActivity, showAllActivity]);

  // Get variant color for progress ring
  const getVariantColor = (variant) => {
    const colors = {
      primary: 'var(--admin-primary)',
      success: 'var(--admin-success)',
      warning: 'var(--admin-warning)',
      error: 'var(--admin-error)',
    };
    return colors[variant] || colors.primary;
  };

  return (
    <AdminLayout>
      <Head>
        <title>Admin Dashboard - My Portfolio</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      
      <div className={styles.dashboard}>
        {/* Header */}
        <motion.header 
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.headerContent}>
            <div className={styles.headerText}>
              <h1 className={styles.headerTitle}>Dashboard</h1>
              <p className={styles.headerSubtitle}>
                Welcome back! Here's what's happening with your portfolio.
              </p>
            </div>
            <button 
              className={`${styles.refreshButton} ${refreshing ? styles.spinning : ''}`}
              onClick={handleRefresh}
              disabled={refreshing || isLoading}
              aria-label="Refresh dashboard"
            >
              <Icons.RefreshCw />
              <span>Refresh</span>
            </button>
          </div>
        </motion.header>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              className={styles.loadingContainer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key="loading"
            >
              <div className={styles.loadingSpinner}>
                <InlineSpinner sizePx={40} />
              </div>
              <p className={styles.loadingText}>Loading dashboard data...</p>
            </motion.div>
          ) : statsError ? (
            <motion.div 
              className={styles.errorState}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key="error"
            >
              <div className={styles.errorIcon}>
                <Icons.AlertTriangle />
              </div>
              <h3 className={styles.errorTitle}>Unable to Load Dashboard</h3>
              <p className={styles.errorMessage}>{statsError}</p>
              <button className={styles.retryButton} onClick={() => window.location.reload()}>
                Try Again
              </button>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              key="content"
            >
              {/* KPI Cards Grid */}
              <section className={styles.kpiSection}>
                <div className={styles.kpiGrid}>
                  {kpiCards.map((card) => (
                    <motion.div
                      key={card.id}
                      className={`${styles.kpiCard} ${styles[`kpiCard${card.variant.charAt(0).toUpperCase() + card.variant.slice(1)}`]}`}
                      variants={itemVariants}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    >
                      <div className={styles.kpiHeader}>
                        <div className={styles.kpiIconWrapper}>
                          <card.icon />
                        </div>
                        <div className={styles.kpiProgress}>
                          <ProgressRing 
                            value={card.progress} 
                            size={42} 
                            strokeWidth={3}
                            color={getVariantColor(card.variant)}
                          />
                        </div>
                      </div>
                      
                      <div className={styles.kpiBody}>
                        <span className={styles.kpiTitle}>{card.title}</span>
                        <span className={styles.kpiValue}>
                          {Number(card.value).toLocaleString()}
                        </span>
                        
                        <div className={styles.kpiFooter}>
                          <div className={`${styles.kpiTrend} ${card.trend.direction === 'up' ? styles.trendUp : styles.trendDown}`}>
                            {card.trend.direction === 'up' ? <Icons.TrendUp /> : <Icons.TrendDown />}
                            <span>{card.trend.value}%</span>
                          </div>
                          <div className={styles.kpiSparkline}>
                            <Sparkline 
                              data={card.sparklineData} 
                              color={getVariantColor(card.variant)}
                              height={28}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Quick Actions */}
              <motion.section className={styles.section} variants={itemVariants}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionTitle}>
                    <Icons.Activity />
                    <h2>Quick Actions</h2>
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.cardBody}>
                    <div className={styles.quickActionsGrid}>
                      <Link className={styles.quickActionItem} href="/admin/articles/new">
                        <div className={styles.quickActionIcon}>
                          <Icons.Articles />
                        </div>
                        <span className={styles.quickActionLabel}>New Article</span>
                      </Link>
                      <Link className={styles.quickActionItem} href="/admin/projects/new">
                        <div className={styles.quickActionIcon}>
                          <Icons.Projects />
                        </div>
                        <span className={styles.quickActionLabel}>New Project</span>
                      </Link>
                      <Link className={styles.quickActionItem} href="/admin/media">
                        <div className={styles.quickActionIcon}>
                          <Icons.Views />
                        </div>
                        <span className={styles.quickActionLabel}>Media Library</span>
                      </Link>
                      <Link className={styles.quickActionItem} href="/admin/search">
                        <div className={styles.quickActionIcon}>
                          <Icons.Chart />
                        </div>
                        <span className={styles.quickActionLabel}>Search</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* Recent Activity */}
              <motion.section 
                className={styles.activitySection}
                variants={itemVariants}
              >
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionTitle}>
                    <Icons.Clock />
                    <h2>Recent Activity</h2>
                  </div>
                  {Array.isArray(recentActivity) && recentActivity.length > 8 && (
                    <div className={styles.sectionActions}>
                      <button
                        type="button"
                        className={styles.sectionLink}
                        onClick={() => setShowAllActivity((v) => !v)}
                        aria-label={showAllActivity ? 'Show less activity' : 'Show all activity'}
                      >
                        {showAllActivity ? 'Show Less' : 'Show All'}
                      </button>
                    </div>
                  )}
                </div>
                
                <div className={styles.activityCard}>
                  {recentActivity.length > 0 ? (
                    <Table columns={activityColumns} data={activityRows} />
                  ) : (
                    <div className={styles.emptyActivity}>
                      <Icons.Activity />
                      <p>No recent activity</p>
                    </div>
                  )}
                </div>
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
