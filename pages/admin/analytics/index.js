import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/Admin/AdminLayout/AdminLayout';
import LineChart from '../../../components/Admin/Charts/LineChart';
import DoughnutChart from '../../../components/Admin/Charts/DoughnutChart';
import styles from './analytics.module.css';

const AnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/analytics');
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch stats');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const processChartData = () => {
    if (!stats) return {};

    const articleStatusData = {
      labels: stats.articleStats.map(s => s._id ? 'Published' : 'Draft'),
      datasets: [{
        label: 'Articles by Status',
        data: stats.articleStats.map(s => s.count),
        backgroundColor: ['#36A2EB', '#FF6384'],
      }],
    };

    const projectStatusData = {
      labels: stats.projectStats.map(s => s._id ? 'Published' : 'Draft'),
      datasets: [{
        label: 'Projects by Status',
        data: stats.projectStats.map(s => s.count),
        backgroundColor: ['#4BC0C0', '#FFCD56'],
      }],
    };

    const articlesTrendData = {
      labels: stats.articlesByDate.map(d => d._id),
      datasets: [{
        label: 'Articles Created Over Time',
        data: stats.articlesByDate.map(d => d.count),
        borderColor: '#4f46e5',
        tension: 0.1,
      }],
    };

    return { articleStatusData, projectStatusData, articlesTrendData };
  };

  const { articleStatusData, projectStatusData, articlesTrendData } = processChartData();

  if (loading) return <AdminLayout><p>Loading analytics...</p></AdminLayout>;
  if (error) return <AdminLayout><p>Error: {error}</p></AdminLayout>;

  return (
    <AdminLayout title="Analytics">
      <h1>Analytics Dashboard</h1>
      <div className={styles.chartsGrid}>
        <div className={styles.chartContainer}>
          <h3>Articles by Status</h3>
          {articleStatusData && <DoughnutChart data={articleStatusData} />}
        </div>
        <div className={styles.chartContainer}>
          <h3>Projects by Status</h3>
          {projectStatusData && <DoughnutChart data={projectStatusData} />}
        </div>
        <div className={`${styles.chartContainer} ${styles.fullWidth}`}>
          <h3>Article Creation Trend</h3>
          {articlesTrendData && <LineChart data={articlesTrendData} />}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AnalyticsPage;
