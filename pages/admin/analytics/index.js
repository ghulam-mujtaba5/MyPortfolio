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
          backgroundColor: ["#36A2EB", "#FF6384"],
        },
      ],
    };

    const projectStatusData = {
      labels: stats.projectStats.map((s) => (s._id ? "Published" : "Draft")),
      datasets: [
        {
          label: "Projects by Status",
          data: stats.projectStats.map((s) => s.count),
          backgroundColor: ["#4BC0C0", "#FFCD56"],
        },
      ],
    };

    const articlesTrendData = {
      labels: stats.articlesByDate.map((d) => d._id),
      datasets: [
        {
          label: "Articles Created Over Time",
          data: stats.articlesByDate.map((d) => d.count),
          borderColor: "#4f46e5",
          tension: 0.1,
        },
      ],
    };

    const projectsTrendData = {
      labels: stats.projectsByDate.map((d) => d._id),
      datasets: [
        {
          label: "Projects Created Over Time",
          data: stats.projectsByDate.map((d) => d.count),
          borderColor: "#14b8a6",
          tension: 0.1,
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
          borderColor: "#4f46e5",
          tension: 0.1,
        },
        {
          label: "Projects",
          data: combinedLabels.map((d) => projectCountByDate.get(d) || 0),
          borderColor: "#14b8a6",
          tension: 0.1,
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
        <div style={{ padding: 24, display: "flex", alignItems: "center", gap: 8 }}>
          <InlineSpinner sizePx={20} />
          <span>Loading analytics…</span>
        </div>
      </AdminLayout>
    );
  if (error)
    return (
      <AdminLayout>
        <p>Error: {error}</p>
      </AdminLayout>
    );

  return (
    <AdminLayout title="Analytics">
      <h1 className={commonStyles.pageTitle}>Analytics Dashboard</h1>
      {/* KPI Tiles with Sparklines */}
      <div className={`${commonStyles.kpiGrid}`}>
        <div className={`${commonStyles.kpiCard} ${themeStyles.kpiCard}`}>
          <div className={commonStyles.kpiTitle}>Total Articles</div>
          <div className={commonStyles.kpiRow}>
            <div className={commonStyles.kpiValue}>
              {stats?.kpis?.totalArticles ?? "-"}
            </div>
            {(() => {
              const delta = computeDeltaPct(stats?.articlesByDate || [], 7);
              if (delta === null) return null;
              const pos = delta >= 0;
              const sign = pos ? "+" : "";
              return (
                <span className={`${commonStyles.deltaText} ${pos ? themeStyles.deltaPositive : themeStyles.deltaNegative}`}>
                  {sign}
                  {delta.toFixed(1)}% vs prev 7d
                </span>
              );
            })()}
          </div>
          <Sparklines
            data={(stats?.articlesByDate || []).map((d) => d.count)}
            height={30}
            margin={5}
          >
            <SparklinesLine color="#4f46e5" className={commonStyles.sparklineNoFill} />
            <SparklinesSpots size={2} />
            <SparklinesReferenceLine type="mean" className={commonStyles.sparklineRefMean} />
          </Sparklines>
        </div>
        <div className={`${commonStyles.kpiCard} ${themeStyles.kpiCard}`}>
          <div className={commonStyles.kpiTitle}>Published Articles</div>
          <div className={commonStyles.kpiRow}>
            <div className={commonStyles.kpiValue}>
              {stats?.kpis?.publishedArticles ?? "-"}
            </div>
            {(() => {
              const delta = computeDeltaPct(stats?.articlesByDate || [], 7);
              if (delta === null) return null;
              const pos = delta >= 0;
              const sign = pos ? "+" : "";
              return (
                <span className={`${commonStyles.deltaText} ${pos ? themeStyles.deltaPositive : themeStyles.deltaNegative}`}>
                  {sign}
                  {delta.toFixed(1)}% vs prev 7d
                </span>
              );
            })()}
          </div>
          <Sparklines
            data={(stats?.articlesByDate || []).map((d) => d.count)}
            height={30}
            margin={5}
          >
            <SparklinesLine color="#6366f1" className={commonStyles.sparklineNoFill} />
          </Sparklines>
        </div>
        <div className={`${commonStyles.kpiCard} ${themeStyles.kpiCard}`}>
          <div className={commonStyles.kpiTitle}>Total Projects</div>
          <div className={commonStyles.kpiRow}>
            <div className={commonStyles.kpiValue}>
              {stats?.kpis?.totalProjects ?? "-"}
            </div>
            {(() => {
              const delta = computeDeltaPct(stats?.projectsByDate || [], 7);
              if (delta === null) return null;
              const pos = delta >= 0;
              const sign = pos ? "+" : "";
              return (
                <span className={`${commonStyles.deltaText} ${pos ? themeStyles.deltaPositive : themeStyles.deltaNegative}`}>
                  {sign}
                  {delta.toFixed(1)}% vs prev 7d
                </span>
              );
            })()}
          </div>
          <Sparklines
            data={(stats?.projectsByDate || []).map((d) => d.count)}
            height={30}
            margin={5}
          >
            <SparklinesLine color="#14b8a6" className={commonStyles.sparklineNoFill} />
          </Sparklines>
        </div>
        <div className={`${commonStyles.kpiCard} ${themeStyles.kpiCard}`}>
          <div className={commonStyles.kpiTitle}>Published Projects</div>
          <div className={commonStyles.kpiRow}>
            <div className={commonStyles.kpiValue}>
              {stats?.kpis?.publishedProjects ?? "-"}
            </div>
            {(() => {
              const delta = computeDeltaPct(stats?.projectsByDate || [], 7);
              if (delta === null) return null;
              const pos = delta >= 0;
              const sign = pos ? "+" : "";
              return (
                <span className={`${commonStyles.deltaText} ${pos ? themeStyles.deltaPositive : themeStyles.deltaNegative}`}>
                  {sign}
                  {delta.toFixed(1)}% vs prev 7d
                </span>
              );
            })()}
          </div>
          <Sparklines
            data={(stats?.projectsByDate || []).map((d) => d.count)}
            height={30}
            margin={5}
          >
            <SparklinesLine color="#10b981" className={commonStyles.sparklineNoFill} />
            <SparklinesSpots size={2} />
            <SparklinesReferenceLine type="mean" className={commonStyles.sparklineRefMean} />
          </Sparklines>
        </div>
      </div>
      {/* Range selector */}
      <div className={commonStyles.rangeBar}>
        <span className={commonStyles.rangeLabel}>Range:</span>
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
            className={`${utilities.btn} ${utilities.btnSecondary} ${commonStyles.rangeButton} ${themeStyles.rangeButton} ${range === d ? themeStyles.rangeButtonActive : ""}`}
          >
            {d === 0 ? "All" : `${d}d`}
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
          className={`${utilities.btn} ${utilities.btnSecondary} ${commonStyles.exportButton} ${themeStyles.exportButton}`}
        >
          Export CSV
        </button>
      </div>
      {/* KPI Tiles */}
      {stats?.kpis && (
        <div className={commonStyles.kpiGrid}>
          <div className={`${commonStyles.kpiCard} ${themeStyles.kpiCard}`}>
            <div className={commonStyles.kpiTitle}>Total Articles</div>
            <div className={commonStyles.kpiValue}>{stats.kpis.totalArticles}</div>
          </div>
          <div className={`${commonStyles.kpiCard} ${themeStyles.kpiCard}`}>
            <div className={commonStyles.kpiTitle}>Published Articles</div>
            <div className={commonStyles.kpiValue}>{stats.kpis.publishedArticles}</div>
          </div>
          <div className={`${commonStyles.kpiCard} ${themeStyles.kpiCard}`}>
            <div className={commonStyles.kpiTitle}>Total Projects</div>
            <div className={commonStyles.kpiValue}>{stats.kpis.totalProjects}</div>
          </div>
          <div className={`${commonStyles.kpiCard} ${themeStyles.kpiCard}`}>
            <div className={commonStyles.kpiTitle}>Published Projects</div>
            <div className={commonStyles.kpiValue}>{stats.kpis.publishedProjects}</div>
          </div>
        </div>
      )}
      <div className={`${commonStyles.chartsGrid} ${themeStyles.chartsGrid}`}>
        <div className={`${commonStyles.chartContainer} ${themeStyles.chartContainer}`}>
          <h3>Articles by Status</h3>
          {articleStatusData && <DoughnutChart data={articleStatusData} />}
        </div>
        <div className={`${commonStyles.chartContainer} ${themeStyles.chartContainer}`}>
          <h3>Projects by Status</h3>
          {projectStatusData && <DoughnutChart data={projectStatusData} />}
        </div>
        <div className={`${commonStyles.chartContainer} ${themeStyles.chartContainer} ${commonStyles.fullWidth} ${themeStyles.fullWidth}`}>
          <h3>Articles vs Projects (Combined Trend)</h3>
          {combinedTrendData && <LineChart data={combinedTrendData} />}
        </div>
        <div className={`${commonStyles.chartContainer} ${themeStyles.chartContainer} ${commonStyles.fullWidth} ${themeStyles.fullWidth}`}>
          <h3>Article Creation Trend</h3>
          {articlesTrendData && <LineChart data={articlesTrendData} />}
        </div>
        <div className={`${commonStyles.chartContainer} ${themeStyles.chartContainer} ${commonStyles.fullWidth} ${themeStyles.fullWidth}`}>
          <h3>Project Creation Trend</h3>
          {projectsTrendData && <LineChart data={projectsTrendData} />}
        </div>
      </div>

      {/* Breakdown Sections */}
      <div className={commonStyles.breakdownGrid}>
        <div className={`${commonStyles.sectionCard} ${themeStyles.sectionCard}`}>
          <h3 className={commonStyles.sectionTitle}>Top Article Tags</h3>
          <div className={commonStyles.chips}>
            {stats?.articleTags?.map((t) => (
              <span
                key={t._id}
                onClick={() =>
                  router.push(`/articles?tag=${encodeURIComponent(t._id)}`)
                }
                title="View articles with this tag"
                className={`${commonStyles.chip} ${themeStyles.chip}`}
              >
                {t._id} ({t.count})
              </span>
            ))}
          </div>
        </div>
        <div className={`${commonStyles.sectionCard} ${themeStyles.sectionCard}`}>
          <h3 className={commonStyles.sectionTitle}>Top Project Tags</h3>
          <div className={commonStyles.chips}>
            {stats?.projectTags?.map((t) => (
              <span
                key={t._id}
                onClick={() =>
                  router.push(`/projects?tag=${encodeURIComponent(t._id)}`)
                }
                title="View projects with this tag"
                className={`${commonStyles.chip} ${themeStyles.chip}`}
              >
                {t._id} ({t.count})
              </span>
            ))}
          </div>
        </div>
        <div className={`${commonStyles.sectionCard} ${themeStyles.sectionCard}`}>
          <h3 className={commonStyles.sectionTitle}>Project Categories</h3>
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
                {c._id || "Uncategorized"} — {c.count}
              </li>
            ))}
          </ul>
        </div>
        <div className={`${commonStyles.sectionCard} ${themeStyles.sectionCard}`}>
          <h3 className={commonStyles.sectionTitle}>Top Viewed</h3>
          <div className={commonStyles.twoCol}>
            <div>
              <h4 className={commonStyles.subTitle}>Articles</h4>
              <ul className={commonStyles.list}>
                {stats?.topViewedArticles?.map((a) => (
                  <li
                    key={a.slug}
                    className={commonStyles.listItem}
                    onClick={() => router.push(`/admin/articles/edit/${a._id || a.id}`)}
                  >
                    {a.title} — {a.views} views
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className={commonStyles.subTitle}>Projects</h4>
              <ul className={commonStyles.list}>
                {stats?.topViewedProjects?.map((p) => (
                  <li
                    key={p.slug}
                    className={commonStyles.listItem}
                    onClick={() => router.push(`/admin/projects/edit/${p._id || p.id}`)}
                  >
                    {p.title} — {p.views} views
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className={`${commonStyles.sectionCard} ${themeStyles.sectionCard}`}>
          <h3 className={commonStyles.sectionTitle}>Recent Activity</h3>
          <div className={commonStyles.twoCol}>
            <div>
              <h4 className={commonStyles.subTitle}>Articles</h4>
              <ul className={commonStyles.list}>
                {stats?.recentArticles?.map((a) => (
                  <li
                    key={a.slug}
                    className={commonStyles.listItem}
                    onClick={() => router.push(`/admin/articles/edit/${a._id || a.id}`)}
                  >
                    {a.title} — {new Date(a.createdAt).toLocaleString()} {" "}
                    {a.published ? "(Published)" : "(Draft)"}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className={commonStyles.subTitle}>Projects</h4>
              <ul className={commonStyles.list}>
                {stats?.recentProjects?.map((p) => (
                  <li
                    key={p.slug}
                    className={commonStyles.listItem}
                    onClick={() => router.push(`/admin/projects/edit/${p._id || p.id}`)}
                  >
                    {p.title} — {new Date(p.createdAt).toLocaleString()} {" "}
                    {p.published ? "(Published)" : "(Draft)"}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AnalyticsPage;
