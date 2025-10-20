"use client"

import { useState } from "react"
import { useStore } from "../store"

export default function PomodoroTimer() {
  const { pomodoro, startPomodoro, stopPomodoro } = useStore()
  const [focusMinutes, setFocusMinutes] = useState(pomodoro.config.focusMinutes)
  const [breakMinutes, setBreakMinutes] = useState(pomodoro.config.breakMinutes)

  const handleStart = () => {
    startPomodoro(focusMinutes, breakMinutes)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-4">
      {/* Status Display */}
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="text-sm font-medium text-gray-600 mb-2">
          {pomodoro.state === "IDLE" && "Pronto para começar"}
          {pomodoro.state === "FOCUS" && "🎯 Modo Foco"}
          {pomodoro.state === "BREAK" && "☕ Pausa"}
        </div>

        {pomodoro.state !== "IDLE" && (
          <div className="text-4xl font-bold text-blue-600 mb-4">{formatTime(pomodoro.timeRemaining)}</div>
        )}

        <div className="text-sm text-gray-500">
          Ciclo {pomodoro.currentCycle} de {pomodoro.config.cyclesBeforeLongBreak}
        </div>
      </div>

      {/* Controls */}
      {pomodoro.state === "IDLE" ? (
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tempo de Foco (minutos)</label>
            <input
              type="number"
              value={focusMinutes}
              onChange={(e) => setFocusMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max="120"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tempo de Pausa (minutos)</label>
            <input
              type="number"
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max="60"
            />
          </div>

          <button
            onClick={handleStart}
            className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Iniciar Pomodoro
          </button>
        </div>
      ) : (
        <button
          onClick={stopPomodoro}
          className="w-full bg-red-600 text-white py-3 rounded-md font-medium hover:bg-red-700 transition-colors"
        >
          Parar Pomodoro
        </button>
      )}

      {/* Info */}
      <div className="bg-blue-50 rounded-lg p-4 text-sm text-gray-700">
        <p className="font-medium mb-2">Como funciona:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Durante o foco, sites da blacklist são bloqueados</li>
          <li>Após 4 ciclos, você ganha uma pausa longa</li>
          <li>Modo adaptativo aumenta o tempo de foco gradualmente</li>
        </ul>
      </div>
    </div>
  )
}
