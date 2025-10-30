"use client";

import { useState } from "react";
import { useStore } from "../store";
import { Play, Square, Clock, Pause, Coffee } from "lucide-react";

function formatTime(seconds: number) {
  const s = Math.max(0, seconds | 0);
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function PomodoroTimer() {
  const { pomodoro, startPomodoro, stopPomodoro, pausePomodoro, resumePomodoro, startBreak } = useStore((s: any) => ({
    pomodoro: s.pomodoro,
    startPomodoro: s.startPomodoro,
    stopPomodoro: s.stopPomodoro,
    pausePomodoro: s.pausePomodoro,
    resumePomodoro: s.resumePomodoro,
    startBreak: s.startBreak,
  }));

  // Respeita seu shape atual: shortBreakMinutes existe em PomodoroConfig
  const [focusMinutes, setFocusMinutes] = useState(pomodoro.config.focusMinutes || 25);
  const [breakMinutes, setBreakMinutes] = useState(pomodoro.config.shortBreakMinutes || 5);

  const phase = pomodoro.state.phase;
  const isPaused = pomodoro.state.isPaused;
  const remainingSeconds = Math.ceil((pomodoro.state.remainingMs ?? 0) / 1000);
  const cycleText = `Ciclo ${pomodoro.state.cycleIndex + 1} de ${pomodoro.config.cyclesBeforeLongBreak}`;

  const handleStart = () => {
    // Mantém assinatura do store (dois números) — se desejar,
    // você pode migrar para { config: { focusMinutes, shortBreakMinutes } } no store.
    startPomodoro(focusMinutes, breakMinutes);
  };

  // Renderizar botões baseado no estado
  const renderControls = () => {
    if (phase === "idle") {
      return (
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tempo de Foco (minutos)
            </label>
            <input
              type="number"
              value={focusMinutes}
              onChange={(e) => setFocusMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
              min={1}
              max={120}
              inputMode="numeric"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tempo de Pausa (minutos)
            </label>
            <input
              type="number"
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
              min={1}
              max={60}
              inputMode="numeric"
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
      );
    }
    
    if (phase === "focus_complete") {
      const breakType = pomodoro.state.pendingBreakType === "long" ? "Longa" : "Curta";
      return (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 space-y-4">
          <div className="text-center">
            <div className="text-2xl mb-2">🎯</div>
            <p className="text-green-400 font-medium">Foco Completo!</p>
            <p className="text-sm text-gray-300">Pronto para o descanso?</p>
          </div>
          <button 
            onClick={startBreak} 
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Coffee className="w-5 h-5" />
            Iniciar Pausa {breakType}
          </button>
        </div>
      );
    }
    
    if (isPaused) {
      return (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 space-y-4">
          <div className="text-center">
            <div className="text-2xl mb-2">⏸️</div>
            <p className="text-yellow-400 font-medium">Pomodoro Pausado</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={resumePomodoro} 
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Retomar
            </button>
            <button 
              onClick={stopPomodoro} 
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Square className="w-5 h-5" />
              Parar
            </button>
          </div>
        </div>
      );
    }
    
    // Timer ativo (focus, short_break, long_break)
    return (
      <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-4">
        <div className="flex gap-2">
          <button 
            onClick={pausePomodoro} 
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Pause className="w-5 h-5" />
            Pausar
          </button>
          <button 
            onClick={stopPomodoro} 
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Square className="w-5 h-5" />
            Parar
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
        <div className="text-sm font-medium text-gray-400 mb-2">
          {phase === "idle" && "Pronto para começar"}
          {phase === "focus" && "🎯 Modo Foco"}
          {phase === "short_break" && "☕ Pausa Curta"}
          {phase === "long_break" && "☕ Pausa Longa"}
          {phase === "focus_complete" && "🎯 Foco Completo"}
          {isPaused && " (Pausado)"}
        </div>

        {phase !== "idle" && phase !== "focus_complete" && (
          <div className="text-4xl font-bold text-blue-400 mb-4">
            {formatTime(remainingSeconds)}
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{cycleText}</span>
        </div>
      </div>

      {renderControls()}

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
