import { STORAGE_KEYS, ALARM_NAMES, DEFAULT_POMODORO_CONFIG } from "../../shared/constants";
import type { PomodoroState, PomodoroConfig } from "../../shared/types";
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
  const { [STORAGE_KEYS.POMODORO_STATUS]: currentSnapshot } =
    (await chrome.storage.local.get(STORAGE_KEYS.POMODORO_STATUS)) as any;

  const currentConfig: PomodoroConfig = (currentSnapshot?.config as PomodoroConfig) || DEFAULT_POMODORO_CONFIG;
  const pomodoroConfig = { ...currentConfig, ...(config || {}) } as PomodoroConfig;

  const newState: PomodoroState = {
    phase: "focus",
    isPaused: false,
    cycleIndex: ((currentSnapshot?.state?.cycleIndex as number) || 0) + 1,
    startedAt: new Date().toISOString(),
    endsAt: undefined,
    remainingMs: pomodoroConfig.focusMinutes * 60 * 1000,
  };

  await chrome.storage.local.set({ [STORAGE_KEYS.POMODORO_STATUS]: { config: pomodoroConfig, state: newState } });
  await chrome.alarms.create(ALARM_NAMES.POMODORO, { delayInMinutes: pomodoroConfig.focusMinutes });

  await enablePomodoroBlocking();
  await notifyStateUpdate();

  // Use notifications field if available in settings via storage sync
  const settings = (await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS))[STORAGE_KEYS.SETTINGS] as any;
  const notifyEnabled = settings?.notifications ?? settings?.notificationsEnabled ?? false;
  if (notifyEnabled) {
    chrome.notifications.create("pomodoro-start", {
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "Pomodoro Iniciado",
      message: `Foco por ${pomodoroConfig.focusMinutes} minutos. Mantenha o foco!`,
    });
  }
  console.log("[v0] Pomodoro started:", newState);
}

export async function stopPomodoro() {
  const { [STORAGE_KEYS.POMODORO_STATUS]: currentSnapshot } =
    (await chrome.storage.local.get(STORAGE_KEYS.POMODORO_STATUS)) as any;

  const idleState: PomodoroState = {
    phase: "idle",
    isPaused: false,
    cycleIndex: 0,
    remainingMs: 0,
  };

  const config = (currentSnapshot?.config as PomodoroConfig) || DEFAULT_POMODORO_CONFIG;
  await chrome.storage.local.set({ [STORAGE_KEYS.POMODORO_STATUS]: { config, state: idleState } });
  await chrome.alarms.clear(ALARM_NAMES.POMODORO);
  await disablePomodoroBlocking();
  await notifyStateUpdate();
  console.log("[v0] Pomodoro stopped");
}

async function handlePomodoroAlarm() {
  const { [STORAGE_KEYS.POMODORO_STATUS]: snapshot } =
    (await chrome.storage.local.get(STORAGE_KEYS.POMODORO_STATUS)) as any;

  if (!snapshot?.state) return;

  const status: PomodoroState = snapshot.state as PomodoroState;
  const config: PomodoroConfig = snapshot.config || DEFAULT_POMODORO_CONFIG;

  if (status.phase === "focus") {
    const isLongBreak = status.cycleIndex % config.cyclesBeforeLongBreak === 0;
    const breakMinutes = isLongBreak ? config.longBreakMinutes : config.shortBreakMinutes;
    const newState: PomodoroState = {
      ...status,
      phase: isLongBreak ? "long_break" : "short_break",
      startedAt: new Date().toISOString(),
      remainingMs: breakMinutes * 60 * 1000,
    };

    await chrome.storage.local.set({ [STORAGE_KEYS.POMODORO_STATUS]: { config, state: newState } });
    await chrome.alarms.create(ALARM_NAMES.POMODORO, { delayInMinutes: breakMinutes });
    await disablePomodoroBlocking();
    await notifyStateUpdate();

    const settings = (await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS))[STORAGE_KEYS.SETTINGS] as any;
    const notifyEnabled = settings?.notifications ?? settings?.notificationsEnabled ?? false;
    if (notifyEnabled) {
      chrome.notifications.create("pomodoro-break", {
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "Pausa!",
        message: `Descanse por ${breakMinutes} minutos. Você merece!`,
      });
    }
    console.log("[v0] Pomodoro: Focus → Break");

  } else if (status.phase === "short_break" || status.phase === "long_break") {
    // end of break -> idle
    const idleState: PomodoroState = { phase: "idle", isPaused: false, cycleIndex: status.cycleIndex, remainingMs: 0 };
    await chrome.storage.local.set({ [STORAGE_KEYS.POMODORO_STATUS]: { config, state: idleState } });
    await notifyStateUpdate();

    const settings = (await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS))[STORAGE_KEYS.SETTINGS] as any;
    const notifyEnabled = settings?.notifications ?? settings?.notificationsEnabled ?? false;
    if (notifyEnabled) {
      chrome.notifications.create("pomodoro-cycle-complete", {
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "Ciclo Completo!",
        message: "Pronto para outra sessão de foco?",
      });
    }
    console.log("[v0] Pomodoro: Break → Idle");
  }
}
