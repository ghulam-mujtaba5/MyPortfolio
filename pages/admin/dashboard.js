// pages/admin/dashboard.js
import { useEffect, useState } from 'react';
import AdminLayout from '../../components/Admin/AdminLayout/AdminLayout';
import { FaProjectDiagram, FaFileAlt, FaUsers, FaEye } from 'react-icons/fa';
import LineChart from '../../components/Admin/Charts/LineChart';
import DoughnutChart from '../../components/Admin/Charts/DoughnutChart';
import RecentActivity from '../../components/Admin/Dashboard/RecentActivity';
import QuickActions from '../../components/Admin/Dashboard/QuickActions';
import StatWidget from '../../components/Admin/Dashboard/StatWidget';
import DashboardSkeleton from '../../components/Admin/Dashboard/DashboardSkeleton';
import DateRangePicker from '../../components/Admin/Dashboard/DateRangePicker';
import ChartCard from '../../components/Admin/Dashboard/ChartCard';



const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate.toISOString());
        if (endDate) params.append('endDate', endDate.toISOString());

        const response = await fetch(`/api/admin/stats?${params.toString()}`);
        const result = await response.json();
        if (result.success) {
          setStats(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [startDate, endDate]);

  if (loading) {
    return <AdminLayout><DashboardSkeleton /></AdminLayout>;
  }

  if (!stats) {
    return (
      <AdminLayout>
        <div className="text-center py-10">
          <p className="text-red-500">Failed to load dashboard data. Please try refreshing the page.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <DateRangePicker 
          startDate={startDate} 
          setStartDate={setStartDate} 
          endDate={endDate} 
          setEndDate={setEndDate} 
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatWidget icon={<FaProjectDiagram size={24} />} title="Total Projects" value={stats?.stats.projects ?? '0'} color="blue" />
        <StatWidget icon={<FaFileAlt size={24} />} title="Total Articles" value={stats?.stats.articles ?? '0'} color="green" />
        <StatWidget icon={<FaUsers size={24} />} title="Total Users" value={stats?.stats.users ?? '0'} color="purple" />
        <StatWidget icon={<FaEye size={24} />} title="Total Views" value={stats?.stats.views ?? '0'} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <ChartCard title="Views Over Time" hasData={stats?.viewStats && stats.viewStats.length > 0}>
          <LineChart data={stats.viewStats} />
        </ChartCard>
        <ChartCard title="Content Distribution" hasData={stats?.stats && (stats.stats.projects > 0 || stats.stats.articles > 0)}>
          <DoughnutChart data={stats.stats} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;

