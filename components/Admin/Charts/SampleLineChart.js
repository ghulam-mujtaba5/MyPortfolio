// components/Admin/Charts/SampleLineChart.js
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
const Line = dynamic(() => import("react-chartjs-2").then((m) => m.Line), {
  ssr: false,
});
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { useTheme } from "../../../context/ThemeContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SampleLineChart = ({ labels, dataPoints, label = "Page Views" }) => {
  const { theme } = useTheme();
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const isDarkMode = theme === "dark";
    const textColor = isDarkMode ? "#f3f4f6" : "#1f2937";
    const gridColor = isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";
    const primaryColor = "#3b82f6"; // blue-500

    const resolvedLabels =
      Array.isArray(labels) && labels.length > 0
        ? labels
        : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
    const resolvedData =
      Array.isArray(dataPoints) && dataPoints.length > 0
        ? dataPoints
        : [65, 59, 80, 81, 56, 55, 40];

    const data = {
      labels: resolvedLabels,
      datasets: [
        {
          label,
          data: resolvedData,
          fill: true,
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, "rgba(59, 130, 246, 0.5)");
            gradient.addColorStop(1, "rgba(59, 130, 246, 0.0)");
            return gradient;
          },
          borderColor: primaryColor,
          borderWidth: 2,
          tension: 0.4,
          pointBackgroundColor: isDarkMode ? "#111827" : "#ffffff",
          pointBorderColor: primaryColor,
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: primaryColor,
          pointHoverBorderColor: "#ffffff",
        },
      ],
    };

    setChartData({ data, options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: isDarkMode ? "rgba(17, 24, 39, 0.9)" : "rgba(255, 255, 255, 0.9)",
          titleColor: textColor,
          bodyColor: textColor,
          borderColor: gridColor,
          borderWidth: 1,
          padding: 10,
          displayColors: false,
          callbacks: {
            label: (context) => `${context.parsed.y} views`,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: isDarkMode ? "#9ca3af" : "#6b7280",
            font: {
              family: "'Inter', sans-serif",
              size: 11,
            },
          },
          grid: {
            display: false,
          },
        },
        y: {
          ticks: {
            color: isDarkMode ? "#9ca3af" : "#6b7280",
            font: {
              family: "'Inter', sans-serif",
              size: 11,
            },
            maxTicksLimit: 5,
          },
          grid: {
            color: gridColor,
            borderDash: [4, 4],
            drawBorder: false,
          },
          beginAtZero: true,
        },
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
    }});
  }, [theme, labels, dataPoints, label]);

  if (!chartData) return null;

  return <Line options={chartData.options} data={chartData.data} />;
};

export default SampleLineChart;
