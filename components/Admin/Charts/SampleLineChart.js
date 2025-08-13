// components/Admin/Charts/SampleLineChart.js
import dynamic from "next/dynamic";
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
);

const SampleLineChart = ({ labels, dataPoints, label = "Page Views" }) => {
  const { theme } = useTheme();

  const isDarkMode = theme === "dark";
  const gridColor = isDarkMode
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.1)";
  const textColor = isDarkMode ? "#e5e5e5" : "#222222";
  const brandColor = "#4573df"; // Brand Blue

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
        fill: false,
        borderColor: brandColor,
        tension: 0.4,
        pointBackgroundColor: brandColor,
        pointBorderColor: "#fff",
        pointHoverRadius: 7,
        pointHoverBackgroundColor: brandColor,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: textColor,
          font: {
            family: "'Inter', sans-serif",
          },
        },
      },
      tooltip: {
        backgroundColor: isDarkMode ? "#272c34" : "#ffffff",
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: gridColor,
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {
          color: textColor,
        },
        grid: {
          color: gridColor,
        },
      },
      y: {
        ticks: {
          color: textColor,
        },
        grid: {
          color: gridColor,
        },
      },
    },
  };

  return <Line options={options} data={data} />;
};

export default SampleLineChart;
