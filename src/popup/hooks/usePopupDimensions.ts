import { useState, useEffect, useMemo } from 'react';

export type PopupSize = 'compact' | 'medium' | 'large';

export interface PopupDimensions {
  width: number;
  height: number;
  timerSize: string;
  spacing: {
    indicator: string;
    timer: string;
    button: string;
  };
}

const DIMENSIONS: Record<PopupSize, PopupDimensions> = {
  compact: {
    width: 420,
    height: 340,
    timerSize: 'text-6xl',
    spacing: { 
      indicator: 'mb-5', 
      timer: 'mb-7', 
      button: '' 
    }
  },
  medium: {
    width: 480,
    height: 380,
    timerSize: 'text-7xl',
    spacing: { 
      indicator: 'mb-6', 
      timer: 'mb-8', 
      button: '' 
    }
  },
  large: {
    width: 560,
    height: 440,
    timerSize: 'text-8xl',
    spacing: { 
      indicator: 'mb-8', 
      timer: 'mb-10', 
      button: '' 
    }
  }
};

/**
 * Hook para gerenciar dimensões responsivas do popup
 * Detecta automaticamente o tamanho ideal baseado na resolução da tela
 */
export function usePopupDimensions() {
  const [manualSize, setManualSize] = useState<PopupSize | null>(null);
  const [screenInfo, setScreenInfo] = useState({
    width: 1920,
    height: 1080,
    windowWidth: 1920,
    windowHeight: 1080
  });

  // Detectar informações da tela
  useEffect(() => {
    const updateScreenInfo = () => {
      setScreenInfo({
        width: window.screen.width,
        height: window.screen.height,
        windowWidth: window.outerWidth,
        windowHeight: window.outerHeight
      });
    };

    updateScreenInfo();
    window.addEventListener('resize', updateScreenInfo);
    
    return () => window.removeEventListener('resize', updateScreenInfo);
  }, []);

  // Lógica de auto-ajuste baseada na resolução
  const autoDetectedSize = useMemo((): PopupSize => {
    const screenArea = screenInfo.width * screenInfo.height;
    
    // Tela muito grande (4K+ e resoluções muito altas)
    if (screenArea > 3000000) {
      return 'large';
    }
    
    // Tela grande (1920x1080+)
    if (screenArea > 2000000) {
      return 'medium';
    }
    
    // Tela média (1366x768 a 1920x1080)
    if (screenArea > 1000000) {
      return 'compact';
    }
    
    // Tela pequena (<1366)
    return 'compact';
  }, [screenInfo.width, screenInfo.height]);

  // Tamanho final (manual override ou auto-detectado)
  const currentSize = manualSize || autoDetectedSize;
  const dimensions = DIMENSIONS[currentSize];

  // Função para alternar tamanho manualmente
  const setSize = (size: PopupSize | null) => {
    setManualSize(size);
  };

  // Função para resetar para auto-detecção
  const resetToAuto = () => {
    setManualSize(null);
  };

  return {
    dimensions,
    currentSize,
    isManual: manualSize !== null,
    setSize,
    resetToAuto,
    availableSizes: Object.keys(DIMENSIONS) as PopupSize[]
  };
}
