"use client"

import { useState, useEffect } from "react"
import { Bell, Globe, Palette, TestTube } from "lucide-react"
import type { UserSettings } from "../../shared/types"
import { chromeAPI, isChromeExtension } from "../../shared/chrome-mock"
import { DEFAULT_SETTINGS } from "../../shared/constants"

declare const chrome: any

export default function SettingsView() {
  const [settings, setSettings] = useState<UserSettings>({ ...DEFAULT_SETTINGS })

  const [theme, setTheme] = useState("system")
  const [language, setLanguage] = useState("pt")

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const result = await chromeAPI.storage.sync.get("settings")
    if (result.settings) {
      setSettings({ ...DEFAULT_SETTINGS, ...(result.settings || {}) })
    }
  }

  const updateSetting = async (key: keyof UserSettings, value: any) => {
    const updated = { ...settings, [key]: value }
    await chromeAPI.storage.sync.set({ settings: updated })
    setSettings(updated)
  }

  const testNotification = () => {
    if (isChromeExtension && typeof chrome !== "undefined" && chrome.notifications) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "Teste de Notificação",
        message: "As notificações estão funcionando corretamente!",
      })
    } else {
      alert("Teste de Notificação: As notificações estão funcionando corretamente!")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <h2 className="text-3xl font-bold text-white mb-2">Configurações</h2>
        <p className="text-gray-400">Personalize sua experiência</p>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">GERAL</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-gray-400" />
              <span className="text-white font-medium">Tema</span>
            </div>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
            >
              <option value="system">Seguir Navegador</option>
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-gray-400" />
              <span className="text-white font-medium">Idioma</span>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
            >
              <option value="pt">Português</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">NOTIFICAÇÕES</h3>

        {/* Test notification banner */}
        <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-4">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-blue-300">Se você não concedeu permissão, teste as notificações</span>
          </div>
          <button
            onClick={testNotification}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <TestTube className="w-4 h-4" />
            Testar
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="text-white font-medium">Avisos de Limite de Bloqueio</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications ?? settings.notificationsEnabled ?? true}
                onChange={(e) => updateSetting("notifications", e.target.checked as any)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm text-gray-400">{(settings.notifications ?? settings.notificationsEnabled) ? "On" : "Off"}</span>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="text-white font-medium">Notificação de Resumo Diário</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.analyticsConsent}
                onChange={(e) => updateSetting("analyticsConsent", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm text-gray-400">{settings.analyticsConsent ? "On" : "Off"}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
