"use client"

import { useState, useEffect } from "react"
import { Youtube, Plus, Trash2 } from "lucide-react"
import { chromeAPI } from "../../shared/chrome-mock"

interface YouTubeCustomization {
  hideHomepage: boolean
  hideShorts: boolean
  hideComments: boolean
  hideRecommendations: boolean
}

interface SiteCustomizations {
  [domain: string]: YouTubeCustomization
}

export default function SiteBlockingView() {
  const [customizations, setCustomizations] = useState<SiteCustomizations>({})
  const [blockedSites, setBlockedSites] = useState<string[]>([])
  const [newSite, setNewSite] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [customResult, blacklistResult] = await Promise.all([
      chromeAPI.storage.sync.get("siteCustomizations"),
      chromeAPI.storage.sync.get("blacklist"),
    ])
    setCustomizations(customResult.siteCustomizations || {})
    setBlockedSites(blacklistResult.blacklist || [])
  }

  const updateYouTubeSetting = async (key: keyof YouTubeCustomization, value: boolean) => {
    const updated = {
      ...customizations,
      "youtube.com": {
        ...(customizations["youtube.com"] || {}),
        [key]: value,
      },
    }
    await chromeAPI.storage.sync.set({ siteCustomizations: updated })
    setCustomizations(updated)
  }

  const addBlockedSite = async () => {
    if (!newSite.trim()) return
    const domain = newSite
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "")
    if (blockedSites.includes(domain)) return

    const updated = [...blockedSites, domain]
    await chromeAPI.storage.sync.set({ blacklist: updated })
    chromeAPI.runtime.sendMessage({ type: "ADD_TO_BLACKLIST", payload: { domain } })
    setBlockedSites(updated)
    setNewSite("")
  }

  const removeBlockedSite = async (domain: string) => {
    const updated = blockedSites.filter((site) => site !== domain)
    await chromeAPI.storage.sync.set({ blacklist: updated })
    chromeAPI.runtime.sendMessage({ type: "REMOVE_FROM_BLACKLIST", payload: { domain } })
    setBlockedSites(updated)
  }

  const ytSettings = customizations["youtube.com"] || {
    hideHomepage: false,
    hideShorts: false,
    hideComments: false,
    hideRecommendations: false,
  }

  const toggleOptions = [
    { key: "hideHomepage" as const, label: "Ocultar Página Inicial", icon: "🏠" },
    { key: "hideShorts" as const, label: "Ocultar Shorts", icon: "📱" },
    { key: "hideComments" as const, label: "Ocultar Comentários", icon: "💬" },
    { key: "hideRecommendations" as const, label: "Ocultar Vídeos Recomendados", icon: "📺" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <h2 className="text-3xl font-bold text-white mb-2">Bloqueio de Sites e Elementos</h2>
        <p className="text-gray-400">Controle total sobre distrações online</p>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Sites Bloqueados</h3>

        {/* Blocked sites list */}
        <div className="space-y-2 mb-4">
          {blockedSites.map((site) => (
            <div
              key={site}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
            >
              <span className="text-white font-mono text-sm">{site}</span>
              <button
                onClick={() => removeBlockedSite(site)}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {blockedSites.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum site bloqueado ainda</p>
            </div>
          )}
        </div>

        {/* Add new site */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="exemplo.com"
            value={newSite}
            onChange={(e) => setNewSite(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addBlockedSite()}
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
          />
          <button
            onClick={addBlockedSite}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            Adicionar
          </button>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-red-500/20 rounded-lg">
            <Youtube className="w-6 h-6 text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white">Personalização de Sites</h3>
            <p className="text-sm text-gray-400">YouTube</p>
          </div>
        </div>

        <div className="space-y-3">
          {toggleOptions.map((option) => (
            <div
              key={option.key}
              className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{option.icon}</span>
                <span className="text-white font-medium">{option.label}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={ytSettings[option.key]}
                  onChange={(e) => updateYouTubeSetting(option.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm text-gray-400">{ytSettings[option.key] ? "On" : "Off"}</span>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
