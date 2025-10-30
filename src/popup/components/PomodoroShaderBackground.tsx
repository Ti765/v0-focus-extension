"use client";

import { MeshGradient } from "@paper-design/shaders-react";

interface PomodoroShaderBackgroundProps {
  speed?: number;
  intensity?: number;
  className?: string;
}

export default function PomodoroShaderBackground({ 
  speed = 1.0,
  intensity = 1.0,
  className = ""
}: PomodoroShaderBackgroundProps) {
  // Validate and sanitize speed to prevent division by zero in CSS calc()
  const sanitizedSpeed = Math.max(speed, 0.001);
  
  if (speed <= 0) {
    console.warn('[PomodoroShaderBackground] Invalid speed value:', speed, 'using minimum value 0.001');
  }

  // Cores customizadas em tons de laranja e preto (baseado no exemplo original)
  const orangeColors = [
    "#000000",  // Preto puro (substitui o #000000 original)
    "#1a0a00",  // Preto com toque laranja (substitui o #1a1a1a)
    "#CC3700",  // Laranja escuro (substitui o #333333)
    "#FF4400",  // Laranja principal (substitui o #ffffff)
  ];

  return (
    <div className={`w-full h-full bg-black relative overflow-hidden ${className}`}>
      {/* Apenas MeshGradient - como no exemplo "mesh" original */}
      <MeshGradient
        className="w-full h-full absolute inset-0"
        colors={orangeColors}
        speed={sanitizedSpeed * intensity}
        backgroundColor="#000000"
      />

      {/* Lighting overlay effects - EXATAMENTE como no exemplo original */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ '--animation-speed': sanitizedSpeed } as React.CSSProperties}
      >
        <div className="shader-light-1 absolute top-1/4 left-1/3 w-32 h-32 bg-gray-800/5 rounded-full blur-3xl animate-pulse" />
        <div className="shader-light-2 absolute bottom-1/3 right-1/4 w-24 h-24 bg-white/2 rounded-full blur-2xl animate-pulse" />
        <div className="shader-light-3 absolute top-1/2 right-1/3 w-20 h-20 bg-gray-900/3 rounded-full blur-xl animate-pulse" />
      </div>
    </div>
  );
}
