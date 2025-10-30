import { STORAGE_KEYS, ALARM_NAMES, DEFAULT_POMODORO_CONFIG } from "../../shared/constants";
import type { PomodoroState, PomodoroConfig } from "../../shared/types";
import { enablePomodoroBlocking, disablePomodoroBlocking } from "./blocker";
import { notifyStateUpdate } from "./message-handler";

/**
 * Helper function to get notification setting from storage
 * Centralizes the schema handling for notification preferences
 */
async function getNotificationSetting(): Promise<boolean> {
  const settings = (await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS))[STORAGE_KEYS.SETTINGS] as any;
  return settings?.notifications ?? settings?.notificationsEnabled ?? false;
}

export async function initializePomodoro() {
  console.log("[v0] Initializing Pomodoro module");
  
  // Check for active timer and recover if needed
  await recoverActiveTimer();
  
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === ALARM_NAMES.POMODORO) {
      await handlePomodoroAlarm();
    }
  });
}

async function recoverActiveTimer() {
  try {
    const { [STORAGE_KEYS.POMODORO_STATUS]: snapshot } = await chrome.storage.local.get(STORAGE_KEYS.POMODORO_STATUS);
    
    if (!snapshot?.state || snapshot.state.phase === "idle") {
      return; // No active timer
    }
    
    const state = snapshot.state as PomodoroState;
    const config = snapshot.config || DEFAULT_POMODORO_CONFIG;
    
    if (!state.endsAt) {
      console.log("[v0] Pomodoro recovery: No endsAt timestamp found, stopping timer");
      await stopPomodoro();
      return;
    }
    
    const now = new Date();
    const endsAt = new Date(state.endsAt);
    const remainingMs = Math.max(0, endsAt.getTime() - now.getTime());
    
    if (remainingMs <= 0) {
      console.log("[v0] Pomodoro recovery: Timer should have ended, triggering alarm");
      await handlePomodoroAlarm();
      return;
    }
    
    // Update remaining time and recreate alarm
    const updatedState = {
      ...state,
      remainingMs,
      endsAt: endsAt.toISOString()
    };
    
    await chrome.storage.local.set({ 
      [STORAGE_KEYS.POMODORO_STATUS]: { config, state: updatedState } 
    });
    
    // Recreate alarm for remaining time
    if (remainingMs < 60_000) {
      // If less than 1 minute remaining, trigger alarm immediately
      await chrome.alarms.create(ALARM_NAMES.POMODORO, { delayInMinutes: 0 });
    } else {
      // Otherwise, calculate delay in minutes
      const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
      await chrome.alarms.create(ALARM_NAMES.POMODORO, { delayInMinutes: remainingMinutes });
    }
    
    // Re-enable blocking if in focus phase
    if (state.phase === "focus") {
      await enablePomodoroBlocking();
    }
    
    console.log(`[v0] Pomodoro recovery: Resumed timer with ${remainingMinutes} minutes remaining`);
    
  } catch (error) {
    console.error("[v0] Pomodoro recovery failed:", error);
  }
}

export async function startPomodoro(config?: Partial<PomodoroConfig>) {
  const { [STORAGE_KEYS.POMODORO_STATUS]: currentSnapshot } =
    await chrome.storage.local.get(STORAGE_KEYS.POMODORO_STATUS);

  // Get current stored config or use default
  const currentConfig: PomodoroConfig = currentSnapshot?.config || DEFAULT_POMODORO_CONFIG;
  
  // Merge incoming config with current config (incoming overrides current)
  const pomodoroConfig: PomodoroConfig = {
    ...currentConfig,
    ...config
  };

  // Debug logging to trace config values
  console.log("[v0] Pomodoro config debug:", {
    incomingConfig: config,
    currentConfig: currentConfig,
    finalConfig: pomodoroConfig,
    focusMinutes: pomodoroConfig.focusMinutes,
    shortBreakMinutes: pomodoroConfig.shortBreakMinutes
  });

  const now = new Date();
  const endsAt = new Date(now.getTime() + pomodoroConfig.focusMinutes * 60 * 1000);
  
  const newState: PomodoroState = {
    phase: "focus",
    isPaused: false,
    cycleIndex: ((currentSnapshot?.state?.cycleIndex as number) || 0) + 1,
    startedAt: now.toISOString(),
    endsAt: endsAt.toISOString(),
    remainingMs: pomodoroConfig.focusMinutes * 60 * 1000,
  };

  await chrome.storage.local.set({ [STORAGE_KEYS.POMODORO_STATUS]: { config: pomodoroConfig, state: newState } });
  
  // Debug logging for alarm creation
  console.log("[v0] Creating Pomodoro alarm with delayInMinutes:", pomodoroConfig.focusMinutes);
  await chrome.alarms.create(ALARM_NAMES.POMODORO, { delayInMinutes: pomodoroConfig.focusMinutes });
  
  // Create keep-alive alarm to prevent service worker termination
  // Reduced frequency to 5 minutes to save battery/resources
  await chrome.alarms.create("pomodoro-keepalive", { delayInMinutes: 5, periodInMinutes: 5 });

  await enablePomodoroBlocking();
  await notifyStateUpdate();

  // Use notifications field if available in settings via storage sync
  const notifyEnabled = await getNotificationSetting();
  
  console.log('[v0] Notification settings:', { notifyEnabled });

  if (notifyEnabled) {
    try {
      await chrome.notifications.create("pomodoro-start", {
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "Pomodoro Iniciado",
        message: `Foco por ${pomodoroConfig.focusMinutes} minutos. Mantenha o foco!`,
      });
      console.log('[v0] Notification created successfully');
    } catch (error) {
      console.error('[v0] Failed to create notification:', error);
    }
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
  await chrome.alarms.clear("pomodoro-keepalive");
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
    const now = new Date();
    const endsAt = new Date(now.getTime() + breakMinutes * 60 * 1000);
    
    const newState: PomodoroState = {
      ...status,
      phase: isLongBreak ? "long_break" : "short_break",
      startedAt: now.toISOString(),
      endsAt: endsAt.toISOString(),
      remainingMs: breakMinutes * 60 * 1000,
    };

    await chrome.storage.local.set({ [STORAGE_KEYS.POMODORO_STATUS]: { config, state: newState } });
    await chrome.alarms.create(ALARM_NAMES.POMODORO, { delayInMinutes: breakMinutes });
    
    // Clear keep-alive alarm during break transition to prevent unnecessary firing
    try {
      await chrome.alarms.clear("pomodoro-keepalive");
    } catch (error) {
      console.warn("[v0] Failed to clear keep-alive alarm:", error);
    }
    
    await disablePomodoroBlocking();
    await notifyStateUpdate();

    const notifyEnabled = await getNotificationSetting();
    
    console.log('[v0] Break notification settings:', { notifyEnabled });

    if (notifyEnabled) {
      try {
        await chrome.notifications.create("pomodoro-break", {
          type: "basic",
          iconUrl: "icons/icon48.png",
          title: "Pausa!",
          message: `Descanse por ${breakMinutes} minutos. Você merece!`,
        });
        console.log('[v0] Break notification created successfully');
      } catch (error) {
        console.error('[v0] Failed to create break notification:', error);
      }
    }
    console.log("[v0] Pomodoro: Focus → Break");

  } else if (status.phase === "short_break" || status.phase === "long_break") {
    // end of break -> idle
    const idleState: PomodoroState = { phase: "idle", isPaused: false, cycleIndex: status.cycleIndex, remainingMs: 0 };
    await chrome.storage.local.set({ [STORAGE_KEYS.POMODORO_STATUS]: { config, state: idleState } });
    await chrome.alarms.clear("pomodoro-keepalive");
    await notifyStateUpdate();

    const notifyEnabled = await getNotificationSetting();
    
    console.log('[v0] Cycle complete notification settings:', { notifyEnabled });

    if (notifyEnabled) {
      try {
        await chrome.notifications.create("pomodoro-cycle-complete", {
          type: "basic",
          iconUrl: "icons/icon48.png",
          title: "Ciclo Completo!",
          message: "Pronto para outra sessão de foco?",
        });
        console.log('[v0] Cycle complete notification created successfully');
      } catch (error) {
        console.error('[v0] Failed to create cycle complete notification:', error);
      }
    }
    console.log("[v0] Pomodoro: Break → Idle");
  }
}
