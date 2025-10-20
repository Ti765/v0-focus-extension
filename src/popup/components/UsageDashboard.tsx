import { useStore } from "../store"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js"
import { Pie, Bar } from "react-chartjs-2"

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
        borderWidth: 2,
        borderColor: "#fff",
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
      },
    ],
  }

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

      {/* Charts */}
      {sortedDomains.length > 0 ? (
        <>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Top 5 Sites (Distribuição)</h3>
            <div className="h-48 flex items-center justify-center">
              <Pie data={pieData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Tempo por Site (Minutos)</h3>
            <div className="h-48">
              <Bar
                data={barData}
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

      {/* Info */}
      <div className="bg-green-50 rounded-lg p-4 text-sm text-gray-700">
        <p className="font-medium mb-2">📊 Análise:</p>
        <p className="text-xs">
          Seus dados de uso são armazenados localmente e nunca são compartilhados sem seu consentimento explícito.
        </p>
      </div>
    </div>
  )
}
