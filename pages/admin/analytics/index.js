import { useState, useEffect } from "react";
import AdminLayout from "../../../components/Admin/AdminLayout/AdminLayout";
import { useRouter } from "next/router";
import LineChart from "../../../components/Admin/Charts/LineChart";
import DoughnutChart from "../../../components/Admin/Charts/DoughnutChart";
import commonStyles from "./analytics.module.css";
import lightStyles from "./analytics.light.module.css";
import darkStyles from "./analytics.dark.module.css";
import { useTheme } from "../../../context/ThemeContext";
import utilities from "../../../styles/utilities.module.css";
import InlineSpinner from "../../../components/LoadingAnimation/InlineSpinner";
import {
  Sparklines,
  SparklinesLine,
  SparklinesSpots,
  SparklinesReferenceLine,
} from "react-sparklines";

const AnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState(30); // days; 0 = all time
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

  const { theme } = useTheme();
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;

  if (loading)
    return (
      <AdminLayout>
        <div className={commonStyles.loadingState}>
          <InlineSpinner sizePx={20} />
          <span>Loading analytics dashboard...</span>
        </div>
      </AdminLayout>
    );
  if (error)
    return (
      <AdminLayout>
        <div className={commonStyles.errorState}>
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
      <h1 className={commonStyles.pageTitle}>Analytics Dashboard</h1>
      
      {/* Range selector */}
      <div className={commonStyles.rangeBar}>
        <span className={commonStyles.rangeLabel}>Time Range:</span>
        {[7, 30, 90, 0].map((d) => (
          <button
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
            className={`${commonStyles.rangeButton} ${themeStyles.rangeButton} ${range === d ? commonStyles.rangeButtonActive : ""} ${range === d ? themeStyles.rangeButtonActive : ""}`}
          >
            <Icon name={d === 0 ? "infinity" : "calendar"} size={16} />
            {d === 0 ? "All Time" : `${d}d`}
          </button>
        ))}
        <button
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
          className={`${commonStyles.exportButton} ${themeStyles.exportButton}`}
        >
          <Icon name="download" size={16} />
          Export CSV
        </button>
      </div>

      {/* KPI Tiles with Sparklines */}
      <div className={commonStyles.kpiGrid}>
        <div className={`${commonStyles.kpiCard} ${themeStyles.kpiCard}`}>
          <div className={commonStyles.kpiTitle}>
            <Icon name="file-text" size={16} />
            Total Articles
          </div>
          <div className={commonStyles.kpiRow}>
            <h3 className={commonStyles.kpiValue}>
              {stats?.kpis?.totalArticles ?? "-"}
            </h3>
            {(() => {
              const delta = computeDeltaPct(stats?.articlesByDate || [], 7);
              if (delta === null) return null;
              const pos = delta >= 0;
              const sign = pos ? "+" : "";
              return (
                <span className={`${commonStyles.deltaText} ${pos ? commonStyles.deltaPositive : commonStyles.deltaNegative} ${pos ? themeStyles.deltaPositive : themeStyles.deltaNegative}`}>
                  <Icon name={pos ? "trending-up" : "trending-down"} size={16} />
                  {sign}
                  {delta.toFixed(1)}% vs prev 7d
                </span>
              );
            })()}
          </div>
          <Sparklines
            data={(stats?.articlesByDate || []).map((d) => d.count)}
            height={40}
            margin={5}
          >
            <SparklinesLine color="#3b82f6" className={commonStyles.sparklineNoFill} />
            <SparklinesSpots size={2} />
            <SparklinesReferenceLine type="mean" className={commonStyles.sparklineRefMean} />
          </Sparklines>
        </div>
        <div className={`${commonStyles.kpiCard} ${themeStyles.kpiCard}`}>
          <div className={commonStyles.kpiTitle}>
            <Icon name="check-circle" size={16} />
            Published Articles
          </div>
          <div className={commonStyles.kpiRow}>
            <h3 className={commonStyles.kpiValue}>
              {stats?.kpis?.publishedArticles ?? "-"}
            </h3>
            {(() => {
              const delta = computeDeltaPct(stats?.articlesByDate || [], 7);
              if (delta === null) return null;
              const pos = delta >= 0;
              const sign = pos ? "+" : "";
              return (
                <span className={`${commonStyles.deltaText} ${pos ? commonStyles.deltaPositive : commonStyles.deltaNegative} ${pos ? themeStyles.deltaPositive : themeStyles.deltaNegative}`}>
                  <Icon name={pos ? "trending-up" : "trending-down"} size={16} />
                  {sign}
                  {delta.toFixed(1)}% vs prev 7d
                </span>
              );
            })()}
          </div>
          <Sparklines
            data={(stats?.articlesByDate || []).map((d) => d.count)}
            height={40}
            margin={5}
          >
            <SparklinesLine color="#6366f1" className={commonStyles.sparklineNoFill} />
          </Sparklines>
        </div>
        <div className={`${commonStyles.kpiCard} ${themeStyles.kpiCard}`}>
          <div className={commonStyles.kpiTitle}>
            <Icon name="briefcase" size={16} />
            Total Projects
          </div>
          <div className={commonStyles.kpiRow}>
            <h3 className={commonStyles.kpiValue}>
              {stats?.kpis?.totalProjects ?? "-"}
            </h3>
            {(() => {
              const delta = computeDeltaPct(stats?.projectsByDate || [], 7);
              if (delta === null) return null;
              const pos = delta >= 0;
              const sign = pos ? "+" : "";
              return (
                <span className={`${commonStyles.deltaText} ${pos ? commonStyles.deltaPositive : commonStyles.deltaNegative} ${pos ? themeStyles.deltaPositive : themeStyles.deltaNegative}`}>
                  <Icon name={pos ? "trending-up" : "trending-down"} size={16} />
                  {sign}
                  {delta.toFixed(1)}% vs prev 7d
                </span>
              );
            })()}
          </div>
          <Sparklines
            data={(stats?.projectsByDate || []).map((d) => d.count)}
            height={40}
            margin={5}
          >
            <SparklinesLine color="#10b981" className={commonStyles.sparklineNoFill} />
          </Sparklines>
        </div>
        <div className={`${commonStyles.kpiCard} ${themeStyles.kpiCard}`}>
          <div className={commonStyles.kpiTitle}>
            <Icon name="check-circle" size={16} />
            Published Projects
          </div>
          <div className={commonStyles.kpiRow}>
            <h3 className={commonStyles.kpiValue}>
              {stats?.kpis?.publishedProjects ?? "-"}
            </h3>
            {(() => {
              const delta = computeDeltaPct(stats?.projectsByDate || [], 7);
              if (delta === null) return null;
              const pos = delta >= 0;
              const sign = pos ? "+" : "";
              return (
                <span className={`${commonStyles.deltaText} ${pos ? commonStyles.deltaPositive : commonStyles.deltaNegative} ${pos ? themeStyles.deltaPositive : themeStyles.deltaNegative}`}>
                  <Icon name={pos ? "trending-up" : "trending-down"} size={16} />
                  {sign}
                  {delta.toFixed(1)}% vs prev 7d
                </span>
              );
            })()}
          </div>
          <Sparklines
            data={(stats?.projectsByDate || []).map((d) => d.count)}
            height={40}
            margin={5}
          >
            <SparklinesLine color="#10b981" className={commonStyles.sparklineNoFill} />
            <SparklinesSpots size={2} />
            <SparklinesReferenceLine type="mean" className={commonStyles.sparklineRefMean} />
          </Sparklines>
        </div>
      </div>

      <div className={`${commonStyles.chartsGrid} ${themeStyles.chartsGrid}`}>
        <div className={`${commonStyles.chartContainer} ${themeStyles.chartContainer}`}>
          <h3>
            <Icon name="pie-chart" size={20} />
            Articles by Status
          </h3>
          {articleStatusData ? <DoughnutChart data={articleStatusData} /> : (
            <div className={commonStyles.emptyState}>
              <Icon name="file-text" size={48} />
              <p>No article data available</p>
            </div>
          )}
        </div>
        <div className={`${commonStyles.chartContainer} ${themeStyles.chartContainer}`}>
          <h3>
            <Icon name="pie-chart" size={20} />
            Projects by Status
          </h3>
          {projectStatusData ? <DoughnutChart data={projectStatusData} /> : (
            <div className={commonStyles.emptyState}>
              <Icon name="briefcase" size={48} />
              <p>No project data available</p>
            </div>
          )}
        </div>
        <div className={`${commonStyles.chartContainer} ${themeStyles.chartContainer} ${commonStyles.fullWidth} ${themeStyles.fullWidth}`}>
          <h3>
            <Icon name="bar-chart" size={20} />
            Articles vs Projects (Combined Trend)
          </h3>
          {combinedTrendData ? <LineChart data={combinedTrendData} /> : (
            <div className={commonStyles.emptyState}>
              <Icon name="trending-up" size={48} />
              <p>No trend data available</p>
            </div>
          )}
        </div>
        <div className={`${commonStyles.chartContainer} ${themeStyles.chartContainer} ${commonStyles.fullWidth} ${themeStyles.fullWidth}`}>
          <h3>
            <Icon name="bar-chart" size={20} />
            Article Creation Trend
          </h3>
          {articlesTrendData ? <LineChart data={articlesTrendData} /> : (
            <div className={commonStyles.emptyState}>
              <Icon name="file-text" size={48} />
              <p>No article trend data available</p>
            </div>
          )}
        </div>
        <div className={`${commonStyles.chartContainer} ${themeStyles.chartContainer} ${commonStyles.fullWidth} ${themeStyles.fullWidth}`}>
          <h3>
            <Icon name="bar-chart" size={20} />
            Project Creation Trend
          </h3>
          {projectsTrendData ? <LineChart data={projectsTrendData} /> : (
            <div className={commonStyles.emptyState}>
              <Icon name="briefcase" size={48} />
              <p>No project trend data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Breakdown Sections */}
      <div className={commonStyles.breakdownGrid}>
        <div className={`${commonStyles.sectionCard} ${themeStyles.sectionCard}`}>
          <h3 className={commonStyles.sectionTitle}>
            <Icon name="tag" size={18} />
            Top Article Tags
          </h3>
          <div className={commonStyles.chips}>
            {stats?.articleTags?.length > 0 ? (
              stats?.articleTags?.map((t) => (
                <span
                  key={t._id}
                  onClick={() =>
                    router.push(`/articles?tag=${encodeURIComponent(t._id)}`)
                  }
                  title="View articles with this tag"
                  className={`${commonStyles.chip} ${themeStyles.chip}`}
                >
                  <Icon name="tag" size={14} />
                  {t._id} ({t.count})
                </span>
              ))
            ) : (
              <div className={commonStyles.emptyState}>
                <p>No article tags found</p>
              </div>
            )}
          </div>
        </div>
        <div className={`${commonStyles.sectionCard} ${themeStyles.sectionCard}`}>
          <h3 className={commonStyles.sectionTitle}>
            <Icon name="tag" size={18} />
            Top Project Tags
          </h3>
          <div className={commonStyles.chips}>
            {stats?.projectTags?.length > 0 ? (
              stats?.projectTags?.map((t) => (
                <span
                  key={t._id}
                  onClick={() =>
                    router.push(`/projects?tag=${encodeURIComponent(t._id)}`)
                  }
                  title="View projects with this tag"
                  className={`${commonStyles.chip} ${themeStyles.chip}`}
                >
                  <Icon name="tag" size={14} />
                  {t._id} ({t.count})
                </span>
              ))
            ) : (
              <div className={commonStyles.emptyState}>
                <p>No project tags found</p>
              </div>
            )}
          </div>
        </div>
        <div className={`${commonStyles.sectionCard} ${themeStyles.sectionCard}`}>
          <h3 className={commonStyles.sectionTitle}>
            <Icon name="folder" size={18} />
            Project Categories
          </h3>
          {stats?.projectCategories?.length > 0 ? (
            <ul className={commonStyles.list}>
              {stats?.projectCategories?.map((c) => (
                <li
                  key={c._id}
                  onClick={() =>
                    router.push(
                      `/projects?category=${encodeURIComponent(c._id || "")}`,
                    )
                  }
                  title="View projects in this category"
                  className={commonStyles.listItem}
                >
                  <Icon name="folder" size={14} />
                  {c._id || "Uncategorized"} — {c.count}
                </li>
              ))}
            </ul>
          ) : (
            <div className={commonStyles.emptyState}>
              <p>No project categories found</p>
            </div>
          )}
        </div>
        <div className={`${commonStyles.sectionCard} ${themeStyles.sectionCard}`}>
          <h3 className={commonStyles.sectionTitle}>
            <Icon name="eye" size={18} />
            Top Viewed
          </h3>
          <div className={commonStyles.twoCol}>
            <div>
              <h4 className={commonStyles.subTitle}>
                <Icon name="file-text" size={16} />
                Articles
              </h4>
              {stats?.topViewedArticles?.length > 0 ? (
                <ul className={commonStyles.list}>
                  {stats?.topViewedArticles?.map((a) => (
                    <li
                      key={a.slug}
                      className={commonStyles.listItem}
                      onClick={() => router.push(`/admin/articles/edit/${a._id || a.id}`)}
                    >
                      <Icon name="file-text" size={14} />
                      {a.title} — {a.views} views
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={commonStyles.emptyState}>
                  <p>No articles found</p>
                </div>
              )}
            </div>
            <div>
              <h4 className={commonStyles.subTitle}>
                <Icon name="briefcase" size={16} />
                Projects
              </h4>
              {stats?.topViewedProjects?.length > 0 ? (
                <ul className={commonStyles.list}>
                  {stats?.topViewedProjects?.map((p) => (
                    <li
                      key={p.slug}
                      className={commonStyles.listItem}
                      onClick={() => router.push(`/admin/projects/edit/${p._id || p.id}`)}
                    >
                      <Icon name="briefcase" size={14} />
                      {p.title} — {p.views} views
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={commonStyles.emptyState}>
                  <p>No projects found</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={`${commonStyles.sectionCard} ${themeStyles.sectionCard}`}>
          <h3 className={commonStyles.sectionTitle}>
            <Icon name="clock" size={18} />
            Recent Activity
          </h3>
          <div className={commonStyles.twoCol}>
            <div>
              <h4 className={commonStyles.subTitle}>
                <Icon name="file-text" size={16} />
                Articles
              </h4>
              {stats?.recentArticles?.length > 0 ? (
                <ul className={commonStyles.list}>
                  {stats?.recentArticles?.map((a) => (
                    <li
                      key={a.slug}
                      className={commonStyles.listItem}
                      onClick={() => router.push(`/admin/articles/edit/${a._id || a.id}`)}
                    >
                      <Icon name="file-text" size={14} />
                      {a.title} — {new Date(a.createdAt).toLocaleString()} {" "}
                      {a.published ? "(Published)" : "(Draft)"}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={commonStyles.emptyState}>
                  <p>No recent articles</p>
                </div>
              )}
            </div>
            <div>
              <h4 className={commonStyles.subTitle}>
                <Icon name="briefcase" size={16} />
                Projects
              </h4>
              {stats?.recentProjects?.length > 0 ? (
                <ul className={commonStyles.list}>
                  {stats?.recentProjects?.map((p) => (
                    <li
                      key={p.slug}
                      className={commonStyles.listItem}
                      onClick={() => router.push(`/admin/projects/edit/${p._id || p.id}`)}
                    >
                      <Icon name="briefcase" size={14} />
                      {p.title} — {new Date(p.createdAt).toLocaleString()} {" "}
                      {p.published ? "(Published)" : "(Draft)"}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={commonStyles.emptyState}>
                  <p>No recent projects</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AnalyticsPage;
