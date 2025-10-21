"use client"

import { useState } from "react"
import { BarChart3, Clock, Shield, Settings, LogOut, Focus } from "lucide-react"
import DashboardView from "./views/DashboardView"
import TimeLimitsView from "./views/TimeLimitsView"
import SiteBlockingView from "./views/SiteBlockingView"
import SettingsView from "./views/SettingsView"

type View = "dashboard" | "time-limits" | "site-blocking" | "settings"

const navItems = [
  { id: "dashboard" as View, label: "Painel", icon: BarChart3 },
  { id: "time-limits" as View, label: "Limites de Uso", icon: Clock },
  { id: "site-blocking" as View, label: "Bloqueio de Sites", icon: Shield },
  { id: "settings" as View, label: "Configurações", icon: Settings },
]

function renderView(activeView: View) {
  switch (activeView) {
    case "dashboard":
      return <DashboardView />
    case "time-limits":
      return <TimeLimitsView />
    case "site-blocking":
      return <SiteBlockingView />
    case "settings":
      return <SettingsView />
    default:
      return <DashboardView />
  }
}

export default function OptionsApp() {
  const [activeView, setActiveView] = useState<View>("dashboard")

  return (
    <div className="min-h-screen p-4 md:p-6 bg-[#0d0d1a] text-gray-200">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="w-full md:w-64 flex-shrink-0">
            <div
              className="glass-card p-4 md:p-6 sticky top-6 flex flex-col h-full"
              style={{ minHeight: "calc(100vh - 3rem)" }}
            >
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg">
                    <Focus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Focus</h1>
                  </div>
                </div>
              </div>

              <nav className="space-y-2 flex-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeView === item.id

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveView(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                        isActive
                          ? "bg-blue-500/20 text-white border border-blue-500/30 shadow-md"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? "text-blue-300" : ""}`} />
                      <span className="font-semibold text-sm">{item.label}</span>
                    </button>
                  )
                })}
              </nav>

              <div className="mt-auto pt-6 border-t border-white/10">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                  <LogOut className="w-5 h-5" />
                  <span className="font-semibold text-sm">Sair</span>
                </button>
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0">{renderView(activeView)}</main>
        </div>
      </div>
    </div>
  )
}
