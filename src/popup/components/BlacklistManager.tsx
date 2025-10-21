"use client"

import { useState } from "react"
import { useStore } from "../store"
import { Plus, Trash2 } from "lucide-react"

export default function BlacklistManager() {
  const { blacklist, addToBlacklist, removeFromBlacklist } = useStore()
  const [newDomain, setNewDomain] = useState("")

  const handleAdd = async () => {
    if (!newDomain.trim()) return

    // Extract domain from URL if full URL is provided
    let domain = newDomain.trim()
    try {
      const url = new URL(domain.startsWith("http") ? domain : `https://${domain}`)
      domain = url.hostname
    } catch {
      // If not a valid URL, use as-is
    }

    await addToBlacklist(domain)
    setNewDomain("")
  }

  const handleRemove = async (domain: string) => {
    await removeFromBlacklist(domain)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Sites Bloqueados</h3>

        {/* Blacklist */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {blacklist.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">Nenhum site bloqueado ainda</p>
            </div>
          ) : (
            blacklist.map((entry) => (
              <div
                key={entry.domain}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate font-mono">{entry.domain}</p>
                  <p className="text-xs text-gray-500">{new Date(entry.addedAt).toLocaleDateString("pt-BR")}</p>
                </div>
                <button
                  onClick={() => handleRemove(entry.domain)}
                  className="ml-2 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add Domain */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAdd()}
            placeholder="exemplo.com"
            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500/50"
          />
          <button
            onClick={handleAdd}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <p className="text-xs text-blue-300">💡 Sites bloqueados são impedidos de carregar durante sessões de foco.</p>
      </div>
    </div>
  )
}
