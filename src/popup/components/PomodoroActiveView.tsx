"use client";

import { memo } from "react";
import { Square } from "lucide-react";
import PomodoroShaderBackground from "./PomodoroShaderBackground";
import { usePopupDimensions } from "../hooks/usePopupDimensions";
import { formatTime } from "../formatTime";

interface PomodoroActiveViewProps {
  displayTime: number;
  phase: "focus" | "short_break" | "long_break";
  onStop: () => void;
}

/**
 * Gets the display text for a given pomodoro phase
 * @param phase - The current pomodoro phase
 * @returns The localized phase text
 */
function getPhaseText(phase: "focus" | "short_break" | "long_break"): string {
  switch (phase) {
    case "focus":
      return "Modo Foco";
    case "short_break":
      return "Pausa Curta";
    case "long_break":
      return "Pausa Longa";
    default:
      return "";
  }
}

/**
 * Gets the CSS color class for a given pomodoro phase
 * @param phase - The current pomodoro phase
 * @returns The Tailwind CSS color class
 */
function getPhaseColor(phase: "focus" | "short_break" | "long_break"): string {
  switch (phase) {
    case "focus":
      return "text-orange-300";
    case "short_break":
      return "text-orange-200";
    case "long_break":
      return "text-orange-100";
    default:
      return "text-white";
  }
}

function PomodoroActiveView({ displayTime, phase, onStop }: PomodoroActiveViewProps) {
  const { dimensions } = usePopupDimensions();

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background Shader */}
      <PomodoroShaderBackground 
        speed={1.2} 
        intensity={1.8}
        className="w-full h-full"
      />

      {/* Conteúdo Principal */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        {/* Indicador da Fase */}
        <div className={`text-base font-medium ${dimensions.spacing.indicator} ${getPhaseColor(phase)} text-center`}>
          {getPhaseText(phase)}
        </div>

        {/* Timer Principal */}
        <div 
          className={`${dimensions.timerSize} font-futura font-extrabold text-white text-center ${dimensions.spacing.timer} select-none pomodoro-timer-text`}
        >
          {formatTime(displayTime)}
        </div>

        {/* Botão Parar */}
        <button
          onClick={onStop}
          className="group relative px-8 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 hover:border-red-400/50 text-red-200 hover:text-red-100 rounded-full font-medium transition-all duration-300 backdrop-blur-sm pomodoro-stop-button"
        >
          <div className="flex items-center gap-3">
            <Square className="w-4 h-4" />
            <span className="text-base">Parar Pomodoro</span>
          </div>
          
          {/* Efeito de hover */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </div>

      {/* Overlay de profundidade adicional */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10 pointer-events-none" />
    </div>
  );
}

export default memo(PomodoroActiveView);
