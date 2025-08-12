// components/Charts/LineChart.js
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChart = ({ data, title }) => {
  // Support two input shapes:
  // 1) Array of { date, articleViews, projectViews }
  // 2) Prebuilt Chart.js data object { labels, datasets }
  let chartData;

  if (Array.isArray(data)) {
    const safe = data.filter(Boolean);
    chartData = {
      labels: safe.map(d => new Date(d.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Article Views',
          data: safe.map(d => Number(d.articleViews || 0)),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        },
        {
          label: 'Project Views',
          data: safe.map(d => Number(d.projectViews || 0)),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
      ],
    };
  } else if (data && data.labels && data.datasets) {
    chartData = data;
  } else {
    chartData = { labels: [], datasets: [] };
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title || '',
      },
    },
  };

  return <Line options={options} data={chartData} />;
};

export default LineChart;
