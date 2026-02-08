import { useState, useEffect } from "react";
import AdminLayout from "../../../components/Admin/AdminLayout/AdminLayout";
import { useRouter } from "next/router";
import LineChart from "../../../components/Admin/Charts/LineChart";
import DoughnutChart from "../../../components/Admin/Charts/DoughnutChart";
import styles from "./analytics.premium.module.css";
import utilities from "../../../styles/utilities.module.css";
import InlineSpinner from "../../../components/LoadingAnimation/InlineSpinner";
import Icon from "../../../components/Admin/Icon/Icon";
import {
  Sparklines,
  SparklinesLine,
  SparklinesSpots,
  SparklinesReferenceLine,
} from "react-sparklines";
import { motion } from "framer-motion";

const AnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState(30); // days; 0 = all time
  const [expandedSections, setExpandedSections] = useState({
    kpi: true,
    charts: true,
    breakdown: true
  });
  const router = useRouter();

  // Helper: compute delta % comparing the most recent window vs previous window
  const computeDeltaPct = (series, windowSize = 7) => {
    if (!Array.isArray(series) || series.length < windowSize + 1) return null;
    const values = series.map((d) =>
      typeof d === "number" ? d : d?.count || 0,
    );
    const n = values.length;
    const w = Math.min(windowSize, Math.floor(n / 2));
    if (w === 0) return null;
    const current = values.slice(n - w, n).reduce((a, b) => a + b, 0);
    const prev = values.slice(n - 2 * w, n - w).reduce((a, b) => a + b, 0);
    if (prev === 0) return current === 0 ? 0 : 100;
    return ((current - prev) / prev) * 100;
  };

  // Initialize range from query
  useEffect(() => {
    const qRange = router.query?.range;
    if (typeof qRange !== "undefined") {
      const r = Number(qRange);
      if (!Number.isNaN(r) && r !== range) {
        setRange(r);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query?.range]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          `/api/admin/analytics${range ? `?range=${range}` : ""}`,
        );
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        } else {
          throw new Error(data.message || "Failed to fetch stats");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    setLoading(true);
    fetchStats();
  }, [range]);

  const processChartData = () => {
    if (!stats) return {};

    const articleStatusData = {
      labels: stats.articleStats.map((s) => (s._id ? "Published" : "Draft")),
      datasets: [
        {
          label: "Articles by Status",
          data: stats.articleStats.map((s) => s.count),
          backgroundColor: ["#3b82f6", "#94a3b8"],
        },
      ],
    };

    const projectStatusData = {
      labels: stats.projectStats.map((s) => (s._id ? "Published" : "Draft")),
      datasets: [
        {
          label: "Projects by Status",
          data: stats.projectStats.map((s) => s.count),
          backgroundColor: ["#10b981", "#94a3b8"],
        },
      ],
    };

    const articlesTrendData = {
      labels: stats.articlesByDate.map((d) => d._id),
      datasets: [
        {
          label: "Articles Created Over Time",
          data: stats.articlesByDate.map((d) => d.count),
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.3,
          fill: true,
        },
      ],
    };

    const projectsTrendData = {
      labels: stats.projectsByDate.map((d) => d._id),
      datasets: [
        {
          label: "Projects Created Over Time",
          data: stats.projectsByDate.map((d) => d.count),
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          tension: 0.3,
          fill: true,
        },
      ],
    };

    // Build a combined time-series with union of dates for side-by-side comparison
    const dateSet = new Set([
      ...(stats.articlesByDate || []).map((d) => d._id),
      ...(stats.projectsByDate || []).map((d) => d._id),
    ]);
    const combinedLabels = Array.from(dateSet).sort();
    const articleCountByDate = new Map(
      (stats.articlesByDate || []).map((d) => [d._id, d.count]),
    );
    const projectCountByDate = new Map(
      (stats.projectsByDate || []).map((d) => [d._id, d.count]),
    );
    const combinedTrendData = {
      labels: combinedLabels,
      datasets: [
        {
          label: "Articles",
          data: combinedLabels.map((d) => articleCountByDate.get(d) || 0),
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.3,
          fill: true,
        },
        {
          label: "Projects",
          data: combinedLabels.map((d) => projectCountByDate.get(d) || 0),
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          tension: 0.3,
          fill: true,
        },
      ],
    };

    return {
      articleStatusData,
      projectStatusData,
      articlesTrendData,
      projectsTrendData,
      combinedTrendData,
    };
  };

  const {
    articleStatusData,
    projectStatusData,
    articlesTrendData,
    projectsTrendData,
    combinedTrendData,
  } = processChartData();

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading)
    return (
      <AdminLayout>
        <div className={styles.loadingState}>
          <InlineSpinner sizePx={20} />
          <span>Loading analytics dashboard...</span>
        </div>
      </AdminLayout>
    );
  if (error)
    return (
      <AdminLayout>
        <div className={styles.errorState}>
          <Icon name="alert-triangle" size={48} />
          <h3>Error Loading Analytics</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className={`${utilities.btn} ${utilities.btnPrimary}`}
          >
            <Icon name="refresh-ccw" size={16} />
            Retry
          </button>
        </div>
      </AdminLayout>
    );

  return (
    <AdminLayout title="Analytics">
      <motion.div className={styles.pageTitleRow}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className={styles.pageTitle}>
          <Icon name="bar-chart-2" size={28} />
          Analytics Dashboard
        </h1>
        <p className={styles.pageSubtitle}>
          Insights and trends across your content.
        </p>
      </motion.div>
      
      {/* Range selector */}
      <motion.div 
        className={styles.filterBar}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Time Range</span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[7, 30, 90, 0].map((d) => (
              <motion.button
                key={d}
                type="button"
                onClick={() => {
                  setRange(d);
                  const q = { ...router.query };
                  if (d === 30) {
                    // default; remove from URL for cleanliness
                    delete q.range;
                  } else {
                    q.range = String(d);
                  }
                  router.push({ pathname: router.pathname, query: q }, undefined, {
                    shallow: true,
                  });
                }}
                className={`${styles.rangeButton} ${range === d ? styles.rangeButtonActive : ""} ${range === d ? styles.rangeButtonActive : ""}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon name={d === 0 ? "infinity" : "calendar"} size={16} />
                {d === 0 ? "All Time" : `${d}d`}
              </motion.button>
            ))}
          </div>
        </div>
        <div className={styles.filterActions}>
          <motion.button
            type="button"
            onClick={() => {
              if (!stats) return;
              const rows = [];
              const pushSection = (title) => rows.push([title]);
              const pushHeader = (arr) => rows.push(arr);
              const pushRows = (arr) => arr.forEach((r) => rows.push(r));

              // KPIs
              pushSection("KPIs");
              pushHeader(["Metric", "Value"]);
              pushRows([
                ["Total Articles", stats.kpis?.totalArticles ?? ""],
                ["Published Articles", stats.kpis?.publishedArticles ?? ""],
                ["Total Projects", stats.kpis?.totalProjects ?? ""],
                ["Published Projects", stats.kpis?.publishedProjects ?? ""],
              ]);
              rows.push([]);

              // Trends
              pushSection("Articles By Date");
              pushHeader(["Date", "Count"]);
              pushRows((stats.articlesByDate || []).map((d) => [d._id, d.count]));
              rows.push([]);
              pushSection("Projects By Date");
              pushHeader(["Date", "Count"]);
              pushRows((stats.projectsByDate || []).map((d) => [d._id, d.count]));
              rows.push([]);

              // Tags/Categories
              pushSection("Article Tags");
              pushHeader(["Tag", "Count"]);
              pushRows((stats.articleTags || []).map((t) => [t._id, t.count]));
              rows.push([]);
              pushSection("Project Tags");
              pushHeader(["Tag", "Count"]);
              pushRows((stats.projectTags || []).map((t) => [t._id, t.count]));
              rows.push([]);
              pushSection("Project Categories");
              pushHeader(["Category", "Count"]);
              pushRows(
                (stats.projectCategories || []).map((c) => [
                  c._id || "Uncategorized",
                  c.count,
                ]),
              );
              rows.push([]);

              // Top/Recent
              pushSection("Top Viewed Articles");
              pushHeader(["Title", "Slug", "Views", "Created At", "Id"]);
              pushRows(
                (stats.topViewedArticles || []).map((a) => [
                  a.title,
                  a.slug,
                  a.views,
                  a.createdAt,
                  a._id,
                ]),
              );
              rows.push([]);
              pushSection("Top Viewed Projects");
              pushHeader(["Title", "Slug", "Views", "Created At", "Id"]);
              pushRows(
                (stats.topViewedProjects || []).map((p) => [
                  p.title,
                  p.slug,
                  p.views,
                  p.createdAt,
                  p._id,
                ]),
              );
              rows.push([]);
              pushSection("Recent Articles");
              pushHeader(["Title", "Slug", "Published", "Created At", "Id"]);
              pushRows(
                (stats.recentArticles || []).map((a) => [
                  a.title,
                  a.slug,
                  a.published,
                  a.createdAt,
                  a._id,
                ]),
              );
              rows.push([]);
              pushSection("Recent Projects");
              pushHeader(["Title", "Slug", "Published", "Created At", "Id"]);
              pushRows(
                (stats.recentProjects || []).map((p) => [
                  p.title,
                  p.slug,
                  p.published,
                  p.createdAt,
                  p._id,
                ]),
              );

              const csv = rows
                .map((r) =>
                  r
                    .map((v) => {
                      const s = String(v ?? "");
                      return /[",\n]/.test(s)
                        ? '"' + s.replace(/"/g, '""') + '"'
                        : s;
                    })
                    .join(","),
                )
                .join("\n");
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              const label = range ? `${range}d` : "all";
              a.download = `analytics-export-${label}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className={`${styles.exportButton}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon name="download" size={16} />
            Export CSV
          </motion.button>
        </div>
      </motion.div>

      {/* Statistics Overview Section */}
      <motion.div 
        className={styles.sectionHeader}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className={styles.sectionTitle}>
          <Icon name="activity" size={20} />
          Statistics Overview
        </h2>
        <button 
          className={styles.toggleButton}
          onClick={() => toggleSection('kpi')}
          aria-label={expandedSections.kpi ? "Collapse Statistics Overview" : "Expand Statistics Overview"}
        >
          <Icon name={expandedSections.kpi ? "chevron-up" : "chevron-down"} size={20} />
        </button>
      </motion.div>
      
      {expandedSections.kpi && (
        <motion.div 
          className={styles.kpiGrid}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.div 
            className={`${styles.kpiCard}`}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className={styles.kpiTitle}>
              <Icon name="file-text" size={16} />
              Total Articles
            </div>
            <div className={styles.kpiRow}>
              <h3 className={styles.kpiValue}>
                {stats?.kpis?.totalArticles ?? "-"}
              </h3>
              {(() => {
                const delta = computeDeltaPct(stats?.articlesByDate || [], 7);
                if (delta === null) return null;
                const pos = delta >= 0;
                const sign = pos ? "+" : "";
                return (
                  <span className={`${styles.deltaText} ${pos ? styles.deltaPositive : styles.deltaNegative}`}>
                    <Icon name={pos ? "trending-up" : "trending-down"} size={16} />
                    {sign}
                    {delta.toFixed(1)}% vs prev 7d
                  </span>
                );
              })()}
            </div>
            <div className={styles.sparklineWrapper}>
              <Sparklines
                data={(stats?.articlesByDate || []).map((d) => d.count)}
                height={40}
                margin={5}
              >
                <SparklinesLine color="#3b82f6" className={styles.sparklineNoFill} />
                <SparklinesSpots size={2} />
                <SparklinesReferenceLine type="mean" className={styles.sparklineRefMean} />
              </Sparklines>
            </div>
          </motion.div>
          <motion.div 
            className={`${styles.kpiCard}`}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className={styles.kpiTitle}>
              <Icon name="check-circle" size={16} />
              Published Articles
            </div>
            <div className={styles.kpiRow}>
              <h3 className={styles.kpiValue}>
                {stats?.kpis?.publishedArticles ?? "-"}
              </h3>
              {(() => {
                const delta = computeDeltaPct(stats?.articlesByDate || [], 7);
                if (delta === null) return null;
                const pos = delta >= 0;
                const sign = pos ? "+" : "";
                return (
                  <span className={`${styles.deltaText} ${pos ? styles.deltaPositive : styles.deltaNegative}`}>
                    <Icon name={pos ? "trending-up" : "trending-down"} size={16} />
                    {sign}
                    {delta.toFixed(1)}% vs prev 7d
                  </span>
                );
              })()}
            </div>
            <div className={styles.sparklineWrapper}>
              <Sparklines
                data={(stats?.articlesByDate || []).map((d) => d.count)}
                height={40}
                margin={5}
              >
                <SparklinesLine color="#6366f1" className={styles.sparklineNoFill} />
              </Sparklines>
            </div>
          </motion.div>
          <motion.div 
            className={`${styles.kpiCard}`}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className={styles.kpiTitle}>
              <Icon name="briefcase" size={16} />
              Total Projects
            </div>
            <div className={styles.kpiRow}>
              <h3 className={styles.kpiValue}>
                {stats?.kpis?.totalProjects ?? "-"}
              </h3>
              {(() => {
                const delta = computeDeltaPct(stats?.projectsByDate || [], 7);
                if (delta === null) return null;
                const pos = delta >= 0;
                const sign = pos ? "+" : "";
                return (
                  <span className={`${styles.deltaText} ${pos ? styles.deltaPositive : styles.deltaNegative}`}>
                    <Icon name={pos ? "trending-up" : "trending-down"} size={16} />
                    {sign}
                    {delta.toFixed(1)}% vs prev 7d
                  </span>
                );
              })()}
            </div>
            <div className={styles.sparklineWrapper}>
              <Sparklines
                data={(stats?.projectsByDate || []).map((d) => d.count)}
                height={40}
                margin={5}
              >
                <SparklinesLine color="#10b981" className={styles.sparklineNoFill} />
              </Sparklines>
            </div>
          </motion.div>
          <motion.div 
            className={`${styles.kpiCard}`}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className={styles.kpiTitle}>
              <Icon name="check-circle" size={16} />
              Published Projects
            </div>
            <div className={styles.kpiRow}>
              <h3 className={styles.kpiValue}>
                {stats?.kpis?.publishedProjects ?? "-"}
              </h3>
              {(() => {
                const delta = computeDeltaPct(stats?.projectsByDate || [], 7);
                if (delta === null) return null;
                const pos = delta >= 0;
                const sign = pos ? "+" : "";
                return (
                  <span className={`${styles.deltaText} ${pos ? styles.deltaPositive : styles.deltaNegative}`}>
                    <Icon name={pos ? "trending-up" : "trending-down"} size={16} />
                    {sign}
                    {delta.toFixed(1)}% vs prev 7d
                  </span>
                );
              })()}
            </div>
            <div className={styles.sparklineWrapper}>
              <Sparklines
                data={(stats?.projectsByDate || []).map((d) => d.count)}
                height={40}
                margin={5}
              >
                <SparklinesLine color="#10b981" className={styles.sparklineNoFill} />
                <SparklinesSpots size={2} />
                <SparklinesReferenceLine type="mean" className={styles.sparklineRefMean} />
              </Sparklines>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Analytics & Trends Section */}
      <motion.div 
        className={styles.sectionHeader}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className={styles.sectionTitle}>
          <Icon name="bar-chart-2" size={20} />
          Analytics & Trends
        </h2>
        <button 
          className={styles.toggleButton}
          onClick={() => toggleSection('charts')}
          aria-label={expandedSections.charts ? "Collapse Analytics & Trends" : "Expand Analytics & Trends"}
        >
          <Icon name={expandedSections.charts ? "chevron-up" : "chevron-down"} size={20} />
        </button>
      </motion.div>
      
      {expandedSections.charts && (
        <motion.div 
          className={`${styles.chartsGrid}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <motion.div 
            className={`${styles.chartCard}`}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className={styles.chartHeader}>
              <Icon name="pie-chart" size={20} />
              Articles by Status
            </h3>
            <div className={styles.chartContainer}>
              {articleStatusData ? <DoughnutChart data={articleStatusData} /> : (
                <div className={styles.emptyState}>
                  <Icon name="file-text" size={48} />
                  <p>No article data available</p>
                </div>
              )}
            </div>
          </motion.div>
          <motion.div 
            className={`${styles.chartCard}`}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className={styles.chartHeader}>
              <Icon name="pie-chart" size={20} />
              Projects by Status
            </h3>
            <div className={styles.chartContainer}>
              {projectStatusData ? <DoughnutChart data={projectStatusData} /> : (
                <div className={styles.emptyState}>
                  <Icon name="briefcase" size={48} />
                  <p>No project data available</p>
                </div>
              )}
            </div>
          </motion.div>
          <motion.div 
            className={`${styles.chartCard} ${styles.fullWidth}`}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className={styles.chartHeader}>
              <Icon name="bar-chart" size={20} />
              Articles vs Projects (Combined Trend)
            </h3>
            <div className={styles.chartContainer}>
              {combinedTrendData ? <LineChart data={combinedTrendData} /> : (
                <div className={styles.emptyState}>
                  <Icon name="trending-up" size={48} />
                  <p>No trend data available</p>
                </div>
              )}
            </div>
          </motion.div>
          <motion.div 
            className={`${styles.chartCard} ${styles.fullWidth}`}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className={styles.chartHeader}>
              <Icon name="bar-chart" size={20} />
              Article Creation Trend
            </h3>
            <div className={styles.chartContainer}>
              {articlesTrendData ? <LineChart data={articlesTrendData} /> : (
                <div className={styles.emptyState}>
                  <Icon name="file-text" size={48} />
                  <p>No article trend data available</p>
                </div>
              )}
            </div>
          </motion.div>
          <motion.div 
            className={`${styles.chartCard} ${styles.fullWidth}`}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className={styles.chartHeader}>
              <Icon name="bar-chart" size={20} />
              Project Creation Trend
            </h3>
            <div className={styles.chartContainer}>
              {projectsTrendData ? <LineChart data={projectsTrendData} /> : (
                <div className={styles.emptyState}>
                  <Icon name="briefcase" size={48} />
                  <p>No project trend data available</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Recent Activity Section */}
      <motion.div 
        className={styles.sectionHeader}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h2 className={styles.sectionTitle}>
          <Icon name="clock" size={20} />
          Recent Activity
        </h2>
        <button 
          className={styles.toggleButton}
          onClick={() => toggleSection('breakdown')}
          aria-label={expandedSections.breakdown ? "Collapse Recent Activity" : "Expand Recent Activity"}
        >
          <Icon name={expandedSections.breakdown ? "chevron-up" : "chevron-down"} size={20} />
        </button>
      </motion.div>
      
      {expandedSections.breakdown && (
        <motion.div 
          className={styles.breakdownGrid}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          {/* Top Viewed Section */}
          <motion.div 
            className={`${styles.breakdownCard}`}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className={styles.breakdownHeader}>
              <Icon name="eye" size={18} />
              Top Viewed Content
            </h3>
            <div className={styles.twoColWrapper}>
              <div className={styles.twoCol}>
                <div className={styles.column}>
                  <h4 className={styles.subTitle}>
                    <Icon name="file-text" size={16} />
                    Articles
                  </h4>
                  <div className={styles.listContainer}>
                    {stats?.topViewedArticles?.length > 0 ? (
                      <ul className={styles.list}>
                        {stats?.topViewedArticles?.map((a) => (
                          <motion.li
                            key={a.slug}
                            className={styles.listItem}
                            onClick={() => router.push(`/admin/articles/edit/${a._id || a.id}`)}
                            whileHover={{ x: 10 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Icon name="file-text" size={14} />
                            <div>
                              <div>{a.title}</div>
                              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                {a.views} views
                              </div>
                            </div>
                          </motion.li>
                        ))}
                      </ul>
                    ) : (
                      <div className={styles.emptyState}>
                        <Icon name="file-text" size={48} />
                        <p>No articles found</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.column}>
                  <h4 className={styles.subTitle}>
                    <Icon name="briefcase" size={16} />
                    Projects
                  </h4>
                  <div className={styles.listContainer}>
                    {stats?.topViewedProjects?.length > 0 ? (
                      <ul className={styles.list}>
                        {stats?.topViewedProjects?.map((p) => (
                          <motion.li
                            key={p.slug}
                            className={styles.listItem}
                            onClick={() => router.push(`/admin/projects/edit/${p._id || p.id}`)}
                            whileHover={{ x: 10 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Icon name="briefcase" size={14} />
                            <div>
                              <div>{p.title}</div>
                              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                {p.views} views
                              </div>
                            </div>
                          </motion.li>
                        ))}
                      </ul>
                    ) : (
                      <div className={styles.emptyState}>
                        <Icon name="briefcase" size={48} />
                        <p>No projects found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Recent Content Section */}
          <motion.div 
            className={`${styles.breakdownCard}`}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className={styles.breakdownHeader}>
              <Icon name="clock" size={18} />
              Recently Created
            </h3>
            <div className={styles.twoColWrapper}>
              <div className={styles.twoCol}>
                <div className={styles.column}>
                  <h4 className={styles.subTitle}>
                    <Icon name="file-text" size={16} />
                    Articles
                  </h4>
                  <div className={styles.listContainer}>
                    {stats?.recentArticles?.length > 0 ? (
                      <ul className={styles.list}>
                        {stats?.recentArticles?.map((a) => (
                          <motion.li
                            key={a.slug}
                            className={styles.listItem}
                            onClick={() => router.push(`/admin/articles/edit/${a._id || a.id}`)}
                            whileHover={{ x: 10 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Icon name="file-text" size={14} />
                            <div>
                              <div>{a.title}</div>
                              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                {new Date(a.createdAt).toLocaleDateString()} {" "}
                                <span style={{ 
                                  color: a.published ? 'var(--success)' : 'var(--warning)',
                                  fontWeight: '500'
                                }}>
                                  {a.published ? "(Published)" : "(Draft)"}
                                </span>
                              </div>
                            </div>
                          </motion.li>
                        ))}
                      </ul>
                    ) : (
                      <div className={styles.emptyState}>
                        <Icon name="file-text" size={48} />
                        <p>No recent articles</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.column}>
                  <h4 className={styles.subTitle}>
                    <Icon name="briefcase" size={16} />
                    Projects
                  </h4>
                  <div className={styles.listContainer}>
                    {stats?.recentProjects?.length > 0 ? (
                      <ul className={styles.list}>
                        {stats?.recentProjects?.map((p) => (
                          <motion.li
                            key={p.slug}
                            className={styles.listItem}
                            onClick={() => router.push(`/admin/projects/edit/${p._id || p.id}`)}
                            whileHover={{ x: 10 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Icon name="briefcase" size={14} />
                            <div>
                              <div>{p.title}</div>
                              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                {new Date(p.createdAt).toLocaleDateString()} {" "}
                                <span style={{ 
                                  color: p.published ? 'var(--success)' : 'var(--warning)',
                                  fontWeight: '500'
                                }}>
                                  {p.published ? "(Published)" : "(Draft)"}
                                </span>
                              </div>
                            </div>
                          </motion.li>
                        ))}
                      </ul>
                    ) : (
                      <div className={styles.emptyState}>
                        <Icon name="briefcase" size={48} />
                        <p>No recent projects</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Tags and Categories Section */}
          <motion.div 
            className={`${styles.breakdownCard}`}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className={styles.breakdownHeader}>
              <Icon name="tag" size={18} />
              Popular Tags & Categories
            </h3>
            <div className={styles.chips}>
              {stats?.articleTags?.length > 0 ? (
                stats?.articleTags?.map((t) => (
                  <motion.span
                    key={t._id}
                    onClick={() =>
                      router.push(`/articles?tag=${encodeURIComponent(t._id)}`)
                    }
                    title="View articles with this tag"
                    className={`${styles.chip} ${styles.chipActive}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon name="tag" size={14} />
                    {t._id} ({t.count})
                  </motion.span>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <p>No article tags found</p>
                </div>
              )}
            </div>
            <div className={styles.chips} style={{ marginTop: '1rem' }}>
              {stats?.projectTags?.length > 0 ? (
                stats?.projectTags?.map((t) => (
                  <motion.span
                    key={t._id}
                    onClick={() =>
                      router.push(`/projects?tag=${encodeURIComponent(t._id)}`)
                    }
                    title="View projects with this tag"
                    className={`${styles.chip} ${styles.chipActive}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon name="tag" size={14} />
                    {t._id} ({t.count})
                  </motion.span>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <p>No project tags found</p>
                </div>
              )}
            </div>
            <div style={{ marginTop: '1rem' }}>
              <h4 className={styles.subTitle} style={{ margin: '0 0 0.75rem 0' }}>
                <Icon name="folder" size={16} />
                Project Categories
              </h4>
              {stats?.projectCategories?.length > 0 ? (
                <ul className={styles.list}>
                  {stats?.projectCategories?.map((c) => (
                    <motion.li
                      key={c._id}
                      onClick={() =>
                        router.push(
                          `/projects?category=${encodeURIComponent(c._id || "")}`,
                        )
                      }
                      title="View projects in this category"
                      className={styles.listItem}
                      whileHover={{ x: 10 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon name="folder" size={14} />
                      {c._id || "Uncategorized"} — {c.count}
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <div className={styles.emptyState}>
                  <p>No project categories found</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AdminLayout>
  );
};

export default AnalyticsPage;
