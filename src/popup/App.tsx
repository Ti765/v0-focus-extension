"use client"

import { useEffect, useState } from "react"
import { useStore } from "./store"
import { ExternalLink, Focus } from "lucide-react"
import BlacklistManager from "./components/BlacklistManager"
import PomodoroTimer from "./PomodoroTimer" // Corrigido o caminho de importação
import UsageDashboard from "./components/UsageDashboard"

declare const chrome: any

type Tab = "pomodoro" | "blacklist" | "dashboard"

export default function App() {
  const { isLoading, loadState, listenForUpdates } = useStore()
  const [activeTab, setActiveTab] = useState<Tab>("pomodoro")

  useEffect(() => {
    loadState();
    // Inicia o listener para atualizações em tempo real
    const unsubscribe = listenForUpdates();
    // Limpa o listener quando o popup for fechado
    return () => unsubscribe();
  }, [loadState, listenForUpdates]);

  const openDashboard = () => {
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.create({ url: "options.html" })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px] bg-[#0d0d1a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-400 text-sm">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full min-h-[500px] bg-[#0d0d1a] p-2">
      <div className="glass-card h-full flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md">
                <Focus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-md font-bold text-white">Focus Extension</h1>
              <p className="text-xs text-gray-400">Acesso Rápido</p>
            </div>
          </div>
          <button
            onClick={openDashboard}
            className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors"
            title="Abrir painel completo"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        <div className="flex border-b border-white/10 flex-shrink-0">
          <button
            onClick={() => setActiveTab("pomodoro")}
            className={`flex-1 py-2.5 px-2 text-xs font-semibold transition-colors ${
              activeTab === "pomodoro"
                ? "border-b-2 border-blue-400 text-white bg-blue-500/10"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Pomodoro
          </button>
          <button
            onClick={() => setActiveTab("blacklist")}
            className={`flex-1 py-2.5 px-2 text-xs font-semibold transition-colors ${
              activeTab === "blacklist"
                ? "border-b-2 border-blue-400 text-white bg-blue-500/10"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Bloqueio
          </button>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex-1 py-2.5 px-2 text-xs font-semibold transition-colors ${
              activeTab === "dashboard"
                ? "border-b-2 border-blue-400 text-white bg-blue-500/10"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Dashboard
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          {activeTab === "pomodoro" && <PomodoroTimer />}
          {activeTab === "blacklist" && <BlacklistManager />}
          {activeTab === "dashboard" && <UsageDashboard />}
        </div>
      </div>
    </div>
  )
}
