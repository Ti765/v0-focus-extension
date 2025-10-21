import { useStore } from "../store"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js"
import { Pie, Bar } from "react-chartjs-2"
import { TrendingUp } from "lucide-react"

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

export default function UsageDashboard() {
  const { dailyUsage } = useStore()

  const today = new Date().toISOString().split("T")[0]
  const todayData = dailyUsage[today] || {}

  // Calculate total time
  const totalSeconds = Object.values(todayData).reduce((sum: number, time: any) => sum + time, 0)
  const totalMinutes = Math.floor(totalSeconds / 60)
  const totalHours = Math.floor(totalMinutes / 60)
  const remainingMinutes = totalMinutes % 60

  // Prepare chart data
  const sortedDomains = Object.entries(todayData)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 5)

  const pieData = {
    labels: sortedDomains.map(([domain]) => domain),
    datasets: [
      {
        data: sortedDomains.map(([, time]) => Math.floor((time as number) / 60)),
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(251, 146, 60, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(168, 85, 247, 0.8)",
        ],
        borderWidth: 0,
      },
    ],
  }

  const barData = {
    labels: sortedDomains.map(([domain]) => domain),
    datasets: [
      {
        label: "Minutos",
        data: sortedDomains.map(([, time]) => Math.floor((time as number) / 60)),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderRadius: 6,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "#fff", font: { size: 10 } },
      },
    },
  }

  const barOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#9ca3af", font: { size: 10 } },
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        border: { display: false },
      },
      x: {
        ticks: { color: "#9ca3af", font: { size: 10 } },
        grid: { display: false },
        border: { display: false },
      },
    },
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-medium text-gray-300">Resumo de Hoje</h3>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-400">
            {totalHours}h {remainingMinutes}m
          </div>
          <p className="text-sm text-gray-500 mt-1">Tempo total de navegação</p>
        </div>
      </div>

      {/* Charts */}
      {sortedDomains.length > 0 ? (
        <>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Top 5 Sites</h3>
            <div className="h-48 flex items-center justify-center">
              <Pie data={pieData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Tempo por Site</h3>
            <div className="h-48">
              <Bar data={barData} options={barOptions} />
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center">
          <p className="text-gray-500 text-sm">Nenhum dado de uso para hoje ainda</p>
        </div>
      )}

      {/* Info */}
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
        <p className="text-xs text-green-300">
          📊 Seus dados são armazenados localmente e nunca compartilhados sem consentimento.
        </p>
      </div>
    </div>
  )
}
