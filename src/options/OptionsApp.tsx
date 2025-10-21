"use client"

import { useState } from "react"
import { BarChart3, Clock, Shield, Settings, LogOut, Focus } from "lucide-react"
import DashboardView from "./views/DashboardView"
import TimeLimitsView from "./views/TimeLimitsView"
import SiteBlockingView from "./views/SiteBlockingView"
import SettingsView from "./views/SettingsView"

type View = "dashboard" | "time-limits" | "site-blocking" | "settings"

export default function OptionsApp() {
  const [activeView, setActiveView] = useState<View>("dashboard")

  const navItems = [
    { id: "dashboard" as View, label: "Painel", icon: BarChart3 },
    { id: "time-limits" as View, label: "Limites de Uso", icon: Clock },
    { id: "site-blocking" as View, label: "Bloqueio de Sites", icon: Shield },
    { id: "settings" as View, label: "Configurações", icon: Settings },
  ]

  const renderView = () => {
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

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-6">
          <aside className="w-64 flex-shrink-0">
            <div className="glass-card p-6 sticky top-6 flex flex-col" style={{ minHeight: "calc(100vh - 3rem)" }}>
              {/* Logo and Brand */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                    <Focus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Focus</h1>
                    <p className="text-xs text-gray-400">Extension</p>
                  </div>
                </div>
                <div className="h-px bg-gradient-to-r from-white/20 to-transparent"></div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2 flex-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeView === item.id

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveView(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10"
                          : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  )
                })}
              </nav>

              {/* Logout Button */}
              <div className="mt-auto pt-6 border-t border-white/10">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/30">
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sair</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">{renderView()}</main>
        </div>
      </div>
    </div>
  )
}
