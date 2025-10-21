"use client"

import { useEffect, useState } from "react"
import { useStore } from "./store"
import { ExternalLink } from "lucide-react"
import BlacklistManager from "./components/BlacklistManager"
import PomodoroTimer from "./components/PomodoroTimer"
import UsageDashboard from "./components/UsageDashboard"
import { chrome } from "chrome"

type Tab = "pomodoro" | "blacklist" | "dashboard"

export default function App() {
  const { isLoading, loadState } = useStore()
  const [activeTab, setActiveTab] = useState<Tab>("pomodoro")

  useEffect(() => {
    loadState()
  }, [loadState])

  const openDashboard = () => {
    chrome.tabs.create({ url: "options.html" })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-400">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full min-h-[500px]">
      <div className="glass-card border-0 rounded-none h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Focus Extension</h1>
              <p className="text-sm text-gray-400">Controle rápido</p>
            </div>
            <button
              onClick={openDashboard}
              className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
              title="Abrir painel completo"
            >
              <ExternalLink className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab("pomodoro")}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === "pomodoro"
                ? "border-b-2 border-blue-500 text-blue-400 bg-blue-500/10"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Pomodoro
          </button>
          <button
            onClick={() => setActiveTab("blacklist")}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === "blacklist"
                ? "border-b-2 border-blue-500 text-blue-400 bg-blue-500/10"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Bloqueio
          </button>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === "dashboard"
                ? "border-b-2 border-blue-500 text-blue-400 bg-blue-500/10"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Dashboard
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 flex-1 overflow-y-auto">
          {activeTab === "pomodoro" && <PomodoroTimer />}
          {activeTab === "blacklist" && <BlacklistManager />}
          {activeTab === "dashboard" && <UsageDashboard />}
        </div>
      </div>
    </div>
  )
}
