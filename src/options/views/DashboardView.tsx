import { useStoreShallow, useStore } from "../../popup/store";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, ChartOptions, Filler } from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";
import { useEffect } from "react";

// Registra todos os componentes necessários do Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Filler);

export default function DashboardView() {
  // subscribe only to dailyUsage to avoid re-renders on unrelated state changes
  const dailyUsage = useStoreShallow((s) => s.dailyUsage ?? {});
  
  // Load initial state and listen for updates
  useEffect(() => {
    const s = useStore.getState();
    s.loadState();
    const unsubscribe = s.listenForUpdates();
    return unsubscribe;
  }, []);
  // --- PREPARAÇÃO DOS DADOS ---
  const today = new Date().toISOString().split("T")[0];
  const todayData = (dailyUsage?.[today] && dailyUsage[today].perDomain) || {};

  // CORREÇÃO: Adicionados tipos explícitos para os parâmetros 'a' e 'b' na função sort.
  // A variável 'sortedDomains' agora é usada para alimentar todos os gráficos.
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

  // --- OPÇÕES DOS GRÁFICOS ---
  // CORREÇÃO: O tipo do callback de ticks foi ajustado para aceitar 'string | number'.
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
    <div className="p-4 md:p-6 space-y-6 bg-gray-900 text-white rounded-lg">
      
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6">
              <h3 className="text-sm font-medium text-gray-400">USO TOTAL HOJE</h3>
              <p className="text-3xl font-bold text-white mt-2">{totalHours}h {remainingMinutes}m</p>
          </div>
          <div className="glass-card p-6">
              <h3 className="text-sm font-medium text-gray-400">MÉDIA DIÁRIA (7D)</h3>
              <p className="text-3xl font-bold text-white mt-2">3h 45m</p>
          </div>
          <div className="glass-card p-6">
              <h3 className="text-sm font-medium text-gray-400">SESSÕES POMODORO</h3>
              <p className="text-3xl font-bold text-white mt-2">4</p>
          </div>
      </div>
      
      {sortedDomains.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Linha */}
          <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Tempo de Uso</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>Últimas 24 horas</span>
                  </div>
              </div>
              <div className="h-80">
                <Line data={lineChartData} options={lineChartOptions} />
              </div>
          </div>

          {/* Gráficos de Pizza e Barra */}
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Top 5 Sites (Distribuição)</h3>
              <div className="h-48 flex items-center justify-center">
                <Pie data={pieChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Tempo por Site (Minutos)</h3>
              <div className="h-48">
                <Bar data={barChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <p className="text-gray-400">Nenhum dado de uso registrado para hoje.</p>
        </div>
      )}
    </div>
  );
}
