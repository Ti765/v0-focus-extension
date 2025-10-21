import { useStore } from "../store";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, ChartOptions, ChartData } from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

// Registra todos os componentes necessários do Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title);

export default function UsageDashboard() {
  const { dailyUsage } = useStore();

  // --- PREPARAÇÃO DOS DADOS ---
  const today = new Date().toISOString().split("T")[0];
  const todayData = dailyUsage[today] || {};

  const sortedDomains = Object.entries(todayData)
    .sort(([, a]: [string, number], [, b]: [string, number]) => b - a)
    .slice(0, 5); // Limitar a 5 para melhor visualização no popup

  const totalSeconds = Object.values(todayData).reduce((sum: number, time: number) => sum + time, 0);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  // --- DADOS PARA OS GRÁFICOS ---
  const chartLabels = sortedDomains.map(([domain]) => domain);
  const chartDataMinutes = sortedDomains.map(([, time]) => Math.floor(time / 60));

  const pieChartData: ChartData<'pie'> = {
    labels: chartLabels,
    datasets: [{
      data: chartDataMinutes,
      backgroundColor: [
        "rgba(59, 130, 246, 0.7)", "rgba(16, 185, 129, 0.7)", "rgba(239, 68, 68, 0.7)",
        "rgba(245, 158, 11, 0.7)", "rgba(139, 92, 246, 0.7)",
      ],
      borderColor: "#0d0d1a",
      borderWidth: 2,
    }],
  };

  const barChartData: ChartData<'bar'> = {
    labels: chartLabels,
    datasets: [{
      label: "Minutos",
      data: chartDataMinutes,
      backgroundColor: "rgba(59, 130, 246, 0.6)",
      borderColor: "rgba(59, 130, 246, 1)",
      borderWidth: 1,
      borderRadius: 4,
    }],
  };

  // --- OPÇÕES DOS GRÁFICOS ---
  const pieChartOptions: ChartOptions<'pie'> = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#e5e7eb',
        bodyColor: '#d1d5db',
        padding: 10,
        cornerRadius: 4,
      },
    },
  };

  const barChartOptions: ChartOptions<'bar'> = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#e5e7eb',
        bodyColor: '#d1d5db',
        padding: 10,
        cornerRadius: 4,
      },
    },
    scales: {
      x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
      y: { beginAtZero: true, ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
    }
  };

  return (
    <div className="space-y-4">
      {/* Resumo */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
        <h3 className="text-sm font-medium text-gray-400 mb-1">USO TOTAL HOJE</h3>
        <div className="text-3xl font-bold text-blue-400">
          {totalHours}h {remainingMinutes}m
        </div>
      </div>

      {sortedDomains.length > 0 ? (
        <>
          {/* Gráfico de Pizza (Distribuição) */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Distribuição de Hoje</h3>
            <div className="h-40 flex items-center justify-center">
              <Pie data={pieChartData} options={pieChartOptions} />
            </div>
          </div>

          {/* Gráfico de Barras (Tempo por site) */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Top Sites (Minutos)</h3>
            <div className="h-40">
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center">
          <p className="text-gray-500 text-sm">Nenhum dado de uso para hoje ainda.</p>
        </div>
      )}
    </div>
  );
}

