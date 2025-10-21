"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Clock } from "lucide-react"
import type { TimeLimitEntry } from "../../shared/types"
import { chromeAPI } from "../../shared/chrome-mock"

export default function TimeLimitsView() {
  const [timeLimits, setTimeLimits] = useState<TimeLimitEntry[]>([])
  const [newDomain, setNewDomain] = useState("")
  const [newLimit, setNewLimit] = useState(60)

  useEffect(() => {
    loadTimeLimits()
  }, [])

  const loadTimeLimits = async () => {
    const result = await chromeAPI.storage.sync.get("timeLimits")
    setTimeLimits(result.timeLimits || [])
  }

  const addTimeLimit = async () => {
    if (!newDomain.trim()) return

    const updated = [...timeLimits, { domain: newDomain.trim(), limitMinutes: newLimit }]
    await chromeAPI.storage.sync.set({ timeLimits: updated })
    setTimeLimits(updated)
    setNewDomain("")
    setNewLimit(60)
  }

  const removeTimeLimit = async (domain: string) => {
    const updated = timeLimits.filter((tl) => tl.domain !== domain)
    await chromeAPI.storage.sync.set({ timeLimits: updated })
    setTimeLimits(updated)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <h2 className="text-3xl font-bold text-white mb-2">Limites de Tempo</h2>
        <p className="text-gray-400">Defina limites diários para sites específicos</p>
      </div>

      {/* Add New Limit */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Adicionar Novo Limite</h3>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="exemplo.com"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
          />
          <input
            type="number"
            min="1"
            value={newLimit}
            onChange={(e) => setNewLimit(Number(e.target.value))}
            className="w-32 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
          />
          <button
            onClick={addTimeLimit}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">Limite em minutos por dia</p>
      </div>

      {/* Limits List */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Limites Ativos</h3>
        {timeLimits.length > 0 ? (
          <div className="space-y-3">
            {timeLimits.map((limit) => (
              <div
                key={limit.domain}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div>
                  <div className="text-white font-medium">{limit.domain}</div>
                  <div className="text-sm text-gray-400">{limit.limitMinutes} minutos por dia</div>
                </div>
                <button
                  onClick={() => removeTimeLimit(limit.domain)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum limite configurado</p>
          </div>
        )}
      </div>
    </div>
  )
}
