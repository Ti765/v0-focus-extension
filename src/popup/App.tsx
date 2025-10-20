"use client"

import { useEffect, useState } from "react"
import { useStore } from "./store"
import BlacklistManager from "./components/BlacklistManager"
import PomodoroTimer from "./components/PomodoroTimer"
import UsageDashboard from "./components/UsageDashboard"

type Tab = "pomodoro" | "blacklist" | "dashboard"

export default function App() {
  const { isLoading, loadState } = useStore()
  const [activeTab, setActiveTab] = useState<Tab>("pomodoro")

  useEffect(() => {
    loadState()
  }, [loadState])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <h1 className="text-xl font-bold">Focus Extension</h1>
        <p className="text-sm text-blue-100">Mantenha seu foco e produtividade</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 bg-white">
        <button
          onClick={() => setActiveTab("pomodoro")}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === "pomodoro" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Pomodoro
        </button>
        <button
          onClick={() => setActiveTab("blacklist")}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === "blacklist" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Bloqueio
        </button>
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === "dashboard" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Dashboard
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === "pomodoro" && <PomodoroTimer />}
        {activeTab === "blacklist" && <BlacklistManager />}
        {activeTab === "dashboard" && <UsageDashboard />}
      </div>
    </div>
  )
}
