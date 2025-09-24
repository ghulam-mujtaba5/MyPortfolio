import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({ data }) => {
  // The data is already in the correct format from the analytics page
  const chartData = data;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "var(--text)",
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: "var(--surface)",
        titleColor: "var(--text)",
        bodyColor: "var(--text)",
        borderColor: "var(--border)",
        borderWidth: 1
      }
    },
    cutout: '60%',
    animation: {
      animateRotate: true,
      animateScale: true
    }
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default DoughnutChart;