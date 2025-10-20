"use client"

import { useState } from "react"
import { useStore } from "../store"

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
      {/* Add Domain */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Adicionar Site à Blacklist</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAdd()}
            placeholder="exemplo.com ou https://exemplo.com"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            Adicionar
          </button>
        </div>
      </div>

      {/* Blacklist */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Sites Bloqueados ({blacklist.length})</h3>

        {blacklist.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">Nenhum site bloqueado ainda</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {blacklist.map((entry) => (
              <div
                key={entry.domain}
                className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{entry.domain}</p>
                  <p className="text-xs text-gray-500">
                    Adicionado em {new Date(entry.addedAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(entry.domain)}
                  className="ml-2 text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-yellow-50 rounded-lg p-4 text-sm text-gray-700">
        <p className="font-medium mb-2">💡 Dica:</p>
        <p className="text-xs">
          Sites bloqueados são impedidos de carregar. Durante sessões Pomodoro de foco, o bloqueio é ativado
          automaticamente.
        </p>
      </div>
    </div>
  )
}
