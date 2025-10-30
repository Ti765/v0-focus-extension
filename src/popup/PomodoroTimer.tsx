"use client";

import { useState, useEffect } from "react";
import { useStoreShallow } from "./store";
import type { PopupStore } from "./store";
import { Play, Square, Clock } from "lucide-react";
import PomodoroActiveView from "./components/PomodoroActiveView";

/**
 * Helper function to calculate remaining time in seconds
 * Centralizes the time calculation logic used in both initial state and interval updates
 */
function computeRemainingSeconds(pomodoro: any, focusMinutes: number): number {
  if (pomodoro?.state?.phase === "idle") {
    return focusMinutes * 60;
  }
  if (pomodoro?.state?.endsAt) {
    const now = new Date();
    const endsAt = new Date(pomodoro.state.endsAt);
    const remainingMs = Math.max(0, endsAt.getTime() - now.getTime());
    return Math.ceil(remainingMs / 1000);
  }
  return Math.ceil((pomodoro?.state?.remainingMs ?? 0) / 1000);
}

export default function PomodoroTimer() {
  const { pomodoro, startPomodoro, stopPomodoro } = useStoreShallow((s: PopupStore) => ({
    pomodoro: s.pomodoro,
    startPomodoro: s.startPomodoro,
    stopPomodoro: s.stopPomodoro,
  }));
  const [focusMinutes, setFocusMinutes] = useState<number>(pomodoro?.config?.focusMinutes ?? 25);
  const [breakMinutes, setBreakMinutes] = useState<number>(pomodoro?.config?.shortBreakMinutes ?? 5);
  const [displayTime, setDisplayTime] = useState<number>(() => {
    return computeRemainingSeconds(pomodoro, focusMinutes);
  });

  useEffect(() => {
    // Se estiver inativo, mostre o tempo de foco configurado
    if (pomodoro?.state?.phase === "idle") {
      setDisplayTime(focusMinutes * 60);
      return;
    }

    // Set initial time immediately using shared helper
    setDisplayTime(Math.max(0, computeRemainingSeconds(pomodoro, focusMinutes)));

    // Then set up interval for updates using the same helper
    const interval = setInterval(() => {
      setDisplayTime(Math.max(0, computeRemainingSeconds(pomodoro, focusMinutes)));
    }, 1000);

    return () => clearInterval(interval);
  }, [pomodoro?.state?.phase, pomodoro?.state?.endsAt, pomodoro?.state?.remainingMs, focusMinutes]);

  const handleStart = () => {
    startPomodoro(focusMinutes, breakMinutes);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Se estiver em fase ativa (focus ou break), renderizar view fullscreen
  if (pomodoro?.state?.phase && pomodoro.state.phase !== "idle") {
    return (
      <PomodoroActiveView
        displayTime={displayTime}
        phase={pomodoro.state.phase as "focus" | "short_break" | "long_break"}
        onStop={stopPomodoro}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
        <div className="text-sm font-medium text-gray-400 mb-2">
          {pomodoro?.state?.phase === "idle" && "Pronto para começar"}
          {pomodoro?.state?.phase === "focus" && "🎯 Modo Foco"}
          {(pomodoro?.state?.phase === "short_break" || pomodoro?.state?.phase === "long_break") && "☕ Pausa"}
        </div>

    <div className={`text-4xl font-bold mb-4 ${pomodoro?.state?.phase !== 'idle' ? 'text-blue-400' : 'text-gray-600'}`}>
            {formatTime(displayTime)}
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>
            Ciclo {pomodoro?.state?.cycleIndex ?? 0} de {pomodoro?.config?.cyclesBeforeLongBreak ?? 0}
          </span>
        </div>
      </div>

      {pomodoro?.state?.phase === "idle" ? (
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
