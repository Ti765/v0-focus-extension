import { useStore } from "../store";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, ChartOptions } from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";

// Registra todos os componentes necessários do Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title);

export default function UsageDashboard() {
  const { dailyUsage } = useStore();

  // --- PREPARAÇÃO DOS DADOS ---
  const today = new Date().toISOString().split("T")[0];
  const todayData = dailyUsage[today] || {};

  const sortedDomains = Object.entries(todayData)
    .sort(([, a]: [string, any], [, b]: [string, any]) => b - a)
    .slice(0, 7); // Limita aos 7 domínios mais usados para manter os gráficos legíveis.

  const totalSeconds = Object.values(todayData).reduce((sum: number, time: any) => sum + time, 0);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  // --- DADOS PARA OS GRÁFICOS ---
  const chartLabels = sortedDomains.map(([domain]) => domain);
  const chartData = sortedDomains.map(([, time]) => Math.floor((time as number) / 60));

  const pieChartData = {
    labels: chartLabels,
    datasets: [
      {
        data: chartData,
        backgroundColor: [
          "rgba(59, 130, 246, 0.7)",
          "rgba(16, 185, 129, 0.7)",
          "rgba(239, 68, 68, 0.7)",
          "rgba(245, 158, 11, 0.7)",
          "rgba(139, 92, 246, 0.7)",
          "rgba(236, 72, 153, 0.7)",
          "rgba(6, 182, 212, 0.7)",
        ],
        borderColor: "#ffffff",
        borderWidth: 1,
      },
    ],
  };

  const barChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Minutos de Uso",
        data: chartData,
        backgroundColor: "rgba(59, 130, 246, 0.7)",
      },
    ],
  };
  
  // Dados simulados para o gráfico de linha, você pode adaptar para dados reais de 7 dias
  const lineChartData = {
      labels: ["D-6", "D-5", "D-4", "D-3", "D-2", "Ontem", "Hoje"],
      datasets: [{
          label: "Horas de Foco",
          data: [2.5, 3, 2, 4, 3.5, 5, totalHours + remainingMinutes / 60],
          fill: true,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.3,
      }]
  };

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#4B5563',
        padding: 10,
        titleColor: '#FFFFFF',
        bodyColor: '#E5E7EB',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { 
            color: '#9CA3AF',
            callback: function(value: string | number) {
                return `${value}h`;
            }
        },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        border: { display: false }
      },
      x: {
        ticks: { color: '#9CA3AF', maxRotation: 0 },
        grid: { display: false },
        border: { color: 'rgba(255, 255, 255, 0.1)' }
      },
    },
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Resumo de Hoje</h3>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {totalHours}h {remainingMinutes}m
          </div>
          <p className="text-sm text-gray-500 mt-1">Tempo total de navegação</p>
        </div>
      </div>

      {sortedDomains.length > 0 ? (
        <>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Top 5 Sites (Distribuição)</h3>
            <div className="h-48 flex items-center justify-center">
              <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Tempo por Site (Minutos)</h3>
            <div className="h-48">
              <Bar
                data={barChartData}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Nenhum dado de uso para hoje ainda</p>
        </div>
      )}
    </div>
  );
}
