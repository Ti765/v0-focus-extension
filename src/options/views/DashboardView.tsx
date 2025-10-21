"use client"

import { useEffect, useState } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { Line } from "react-chartjs-2"
import { Calendar, TrendingUp, Clock, Globe } from "lucide-react"
import type { DailyUsage, DomainUsage } from "../../shared/types"
import { chromeAPI } from "../../shared/chrome-mock"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

export default function DashboardView() {
  const [dailyUsage, setDailyUsage] = useState<DailyUsage>({})
  const [selectedDate, setSelectedDate] = useState<string>("")

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    setSelectedDate(today)
    loadUsageData()
  }, [])

  const loadUsageData = async () => {
    const result = await chromeAPI.storage.local.get("dailyUsage")
    setDailyUsage(result.dailyUsage || {})
  }

  const currentDate = selectedDate || new Date().toISOString().split("T")[0]
  const todayData: DomainUsage = dailyUsage[currentDate] || {}

  const totalSeconds = Object.values(todayData).reduce((sum, time) => sum + time, 0)
  const totalMinutes = Math.floor(totalSeconds / 60)
  const totalHours = Math.floor(totalMinutes / 60)
  const remainingMinutes = totalMinutes % 60

  const last7Days = Object.keys(dailyUsage).sort().slice(-7)
  const avgDailySeconds =
    last7Days.length > 0
      ? last7Days.reduce((sum, date) => {
          const dayTotal = Object.values(dailyUsage[date]).reduce((s, t) => s + t, 0)
          return sum + dayTotal
        }, 0) / last7Days.length
      : 0
  const avgHours = Math.floor(avgDailySeconds / 3600)
  const avgMinutes = Math.floor((avgDailySeconds % 3600) / 60)

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const hourlyData = hours.map(() => 0)

  const lineChartData = {
    labels: hours.map((h) => `${h}:00`),
    datasets: [
      {
        label: "Tempo de Uso",
        data: hourlyData,
        borderColor: "rgba(59, 130, 246, 1)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
      },
    ],
  }

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleColor: "#fff",
        bodyColor: "#fff",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#9ca3af", callback: (value: number) => `${value}m` },
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        border: { display: false },
      },
      x: {
        ticks: { color: "#9ca3af", maxRotation: 0 },
        grid: { display: false },
        border: { display: false },
      },
    },
  }

  const sortedDomains = Object.entries(todayData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  const todayString = new Date().toISOString().split("T")[0]

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Painel</h2>
            <p className="text-gray-400">Acompanhe seu uso e produtividade</p>
          </div>
          <div className="flex items-center gap-3">
            {selectedDate && (
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
              >
                <option value={todayString}>Hoje</option>
                {last7Days
                  .slice(-7, -1)
                  .reverse()
                  .map((date) => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString("pt-BR")}
                    </option>
                  ))}
              </select>
            )}
            <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
              <Calendar className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-xs text-gray-500 uppercase tracking-wider">Hoje</span>
          </div>
          <div className="text-sm text-gray-400 mb-2">USO TOTAL</div>
          <div className="text-4xl font-bold text-white">
            {totalHours}h {remainingMinutes}m
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-xs text-gray-500 uppercase tracking-wider">7 dias</span>
          </div>
          <div className="text-sm text-gray-400 mb-2">MÉDIA DE USO DIÁRIO</div>
          <div className="text-4xl font-bold text-white">
            {avgHours}h {avgMinutes}m
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Tempo de Uso</h3>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Globe className="w-4 h-4" />
            <span>Últimas 24 horas</span>
          </div>
        </div>
        <div className="h-80">
          <Line data={lineChartData} options={lineChartOptions} />
        </div>
      </div>

      <div className="glass-card p-6 border-green-500/30">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🔒</div>
          <div>
            <h4 className="font-semibold text-white mb-1">Privacidade Garantida</h4>
            <p className="text-sm text-gray-400">
              Todos os seus dados são armazenados localmente no seu dispositivo e nunca são compartilhados sem seu
              consentimento explícito.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
