import { STORAGE_KEYS, ALARM_NAMES, DEFAULT_POMODORO_CONFIG } from "../../shared/constants";
import type { PomodoroStatus, PomodoroConfig } from "../../shared/types";
import { enablePomodoroBlocking, disablePomodoroBlocking } from "./blocker";
import { notifyStateUpdate } from "./message-handler";

export async function initializePomodoro() {
  console.log("[v0] Initializing Pomodoro module");
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === ALARM_NAMES.POMODORO) {
      await handlePomodoroAlarm();
    }
  });
}

export async function startPomodoro(config?: Partial<PomodoroConfig>) {
  const { [STORAGE_KEYS.POMODORO_STATUS]: currentStatus } = 
    (await chrome.storage.local.get(STORAGE_KEYS.POMODORO_STATUS)) as { [key: string]: PomodoroStatus };

  const pomodoroConfig = { ...(currentStatus?.config || DEFAULT_POMODORO_CONFIG), ...config };

  const newStatus: PomodoroStatus = {
    state: "FOCUS",
    startTime: Date.now(),
    timeRemaining: pomodoroConfig.focusMinutes * 60,
    currentCycle: (currentStatus?.currentCycle || 0) + 1,
    config: pomodoroConfig,
  };

  await chrome.storage.local.set({ [STORAGE_KEYS.POMODORO_STATUS]: newStatus });
  await chrome.alarms.create(ALARM_NAMES.POMODORO, { delayInMinutes: pomodoroConfig.focusMinutes });
  
  await enablePomodoroBlocking();
  await notifyStateUpdate();

  // CORREÇÃO: Verifica a config interna do pomodoro para notificação
  if (pomodoroConfig.notificationsEnabled) {
    chrome.notifications.create('pomodoro-start', {
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "Pomodoro Iniciado",
      message: `Foco por ${pomodoroConfig.focusMinutes} minutos. Mantenha o foco!`,
    });
  }
  console.log("[v0] Pomodoro started:", newStatus);
}

export async function stopPomodoro() {
  const { [STORAGE_KEYS.POMODORO_STATUS]: currentStatus } = 
    (await chrome.storage.local.get(STORAGE_KEYS.POMODORO_STATUS)) as { [key: string]: PomodoroStatus };
  
  const idleStatus: PomodoroStatus = {
    state: "IDLE",
    timeRemaining: 0,
    currentCycle: 0, // Reseta o ciclo ao parar
    config: currentStatus?.config || DEFAULT_POMODORO_CONFIG,
    startTime: undefined,
  };

  await chrome.storage.local.set({ [STORAGE_KEYS.POMODORO_STATUS]: idleStatus });
  await chrome.alarms.clear(ALARM_NAMES.POMODORO);
  await disablePomodoroBlocking();
  await notifyStateUpdate();
  console.log("[v0] Pomodoro stopped");
}

async function handlePomodoroAlarm() {
  const { [STORAGE_KEYS.POMODORO_STATUS]: status } = 
    (await chrome.storage.local.get(STORAGE_KEYS.POMODORO_STATUS)) as { [key: string]: PomodoroStatus };
  
  if (!status) return;

  if (status.state === "FOCUS") {
    const isLongBreak = status.currentCycle % status.config.cyclesBeforeLongBreak === 0;
    const breakMinutes = isLongBreak ? status.config.longBreakMinutes : status.config.breakMinutes;
    const newStatus: PomodoroStatus = { ...status, state: "BREAK", startTime: Date.now(), timeRemaining: breakMinutes * 60 };
    
    await chrome.storage.local.set({ [STORAGE_KEYS.POMODORO_STATUS]: newStatus });
    await chrome.alarms.create(ALARM_NAMES.POMODORO, { delayInMinutes: breakMinutes });
    await disablePomodoroBlocking();
    await notifyStateUpdate();

    if (status.config.notificationsEnabled) {
      chrome.notifications.create('pomodoro-break', {
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "Pausa!",
        message: `Descanse por ${breakMinutes} minutos. Você merece!`,
      });
    }
    console.log("[v0] Pomodoro: Focus → Break");

  } else if (status.state === "BREAK") {
    if (status.config.adaptiveMode && status.currentCycle % status.config.cyclesBeforeLongBreak === 0) {
      status.config.focusMinutes += 5; // Lógica adaptativa
      console.log("[v0] Adaptive mode: Focus time increased to", status.config.focusMinutes);
    }

    const idleStatus: PomodoroStatus = { ...status, state: "IDLE", timeRemaining: 0, startTime: undefined };
    await chrome.storage.local.set({ [STORAGE_KEYS.POMODORO_STATUS]: idleStatus });
    await notifyStateUpdate();

    if (status.config.notificationsEnabled) {
      chrome.notifications.create('pomodoro-cycle-complete', {
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "Ciclo Completo!",
        message: "Pronto para outra sessão de foco?",
      });
    }
    console.log("[v0] Pomodoro: Break → Idle");
  }
}
