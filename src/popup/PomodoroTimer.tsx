"use client";

import { useState, useEffect } from "react";
import { useStore } from "../store";
import { Play, Square, Clock } from "lucide-react";

export default function PomodoroTimer() {
  const { pomodoro, startPomodoro, stopPomodoro } = useStore();
  const [focusMinutes, setFocusMinutes] = useState(pomodoro.config.focusMinutes || 25);
  const [breakMinutes, setBreakMinutes] = useState(pomodoro.config.breakMinutes || 5);
  const [displayTime, setDisplayTime] = useState(pomodoro.timeRemaining);

  useEffect(() => {
    if (pomodoro.state === 'IDLE' || !pomodoro.startTime) {
      // Se estiver inativo, mostre o tempo de foco configurado
      setDisplayTime(focusMinutes * 60);
      return;
    }

    // A lógica do timer agora é gerenciada na UI para uma contagem regressiva suave
    const interval = setInterval(() => {
      const elapsedSeconds = (Date.now() - pomodoro.startTime!) / 1000;
      const remaining = Math.max(0, pomodoro.timeRemaining - elapsedSeconds);
      setDisplayTime(remaining);
    }, 250); // Atualiza 4x por segundo para ser mais preciso

    return () => clearInterval(interval);
  }, [pomodoro.state, pomodoro.startTime, pomodoro.timeRemaining, focusMinutes]);

  const handleStart = () => {
    startPomodoro(focusMinutes, breakMinutes);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
        <div className="text-sm font-medium text-gray-400 mb-2">
          {pomodoro.state === "IDLE" && "Pronto para começar"}
          {pomodoro.state === "FOCUS" && "🎯 Modo Foco"}
          {pomodoro.state === "BREAK" && "☕ Pausa"}
        </div>

        <div className={`text-4xl font-bold mb-4 ${pomodoro.state !== 'IDLE' ? 'text-blue-400' : 'text-gray-600'}`}>
            {formatTime(displayTime)}
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>
            Ciclo {pomodoro.currentCycle} de {pomodoro.config.cyclesBeforeLongBreak}
          </span>
        </div>
      </div>

      {pomodoro.state === "IDLE" ? (
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tempo de Foco (minutos)</label>
            <input
              type="number"
              value={focusMinutes}
              onChange={(e) => setFocusMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
              min="1"
              max="120"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tempo de Pausa (minutos)</label>
            <input
              type="number"
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
              min="1"
              max="60"
            />
          </div>
          <button
            onClick={handleStart}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            Iniciar Pomodoro
          </button>
        </div>
      ) : (
        <button
          onClick={stopPomodoro}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Square className="w-5 h-5" />
          Parar Pomodoro
        </button>
      )}

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <p className="text-xs font-medium text-blue-300 mb-2">Como funciona:</p>
        <ul className="list-disc list-inside space-y-1 text-xs text-blue-200">
          <li>Durante o foco, sites da blacklist são bloqueados</li>
          <li>Após 4 ciclos, você ganha uma pausa longa</li>
          <li>Modo adaptativo aumenta o tempo de foco gradualmente</li>
        </ul>
      </div>
    </div>
  );
}

