import { STORAGE_KEYS, ALARM_NAMES, DEFAULT_POMODORO_CONFIG } from "../../shared/constants"
import type { PomodoroStatus, PomodoroConfig } from "../../shared/types"
import { enablePomodoroBlocking, disablePomodoroBlocking } from "./blocker"
import { chrome } from "chrome-extension-api"

export async function initializePomodoro() {
  console.log("[v0] Initializing Pomodoro module")

  // Set up alarm listener
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === ALARM_NAMES.POMODORO) {
      await handlePomodoroAlarm()
    }
  })
}

export async function startPomodoro(config?: Partial<PomodoroConfig>) {
  const { [STORAGE_KEYS.POMODORO_STATUS]: currentStatus } = await chrome.storage.local.get(STORAGE_KEYS.POMODORO_STATUS)

  const pomodoroConfig = {
    ...DEFAULT_POMODORO_CONFIG,
    ...currentStatus?.config,
    ...config,
  }

  const newStatus: PomodoroStatus = {
    state: "FOCUS",
    timeRemaining: pomodoroConfig.focusMinutes * 60,
    currentCycle: (currentStatus?.currentCycle || 0) + 1,
    config: pomodoroConfig,
  }

  await chrome.storage.local.set({
    [STORAGE_KEYS.POMODORO_STATUS]: newStatus,
  })

  // Create alarm for focus period
  await chrome.alarms.create(ALARM_NAMES.POMODORO, {
    delayInMinutes: pomodoroConfig.focusMinutes,
  })

  // Enable blocking during focus
  await enablePomodoroBlocking()

  // Show notification
  if (currentStatus?.config?.notificationsEnabled !== false) {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "Pomodoro Iniciado",
      message: `Foco por ${pomodoroConfig.focusMinutes} minutos. Mantenha o foco!`,
    })
  }

  console.log("[v0] Pomodoro started:", newStatus)
}

export async function stopPomodoro() {
  const idleStatus: PomodoroStatus = {
    state: "IDLE",
    timeRemaining: 0,
    currentCycle: 0,
    config: DEFAULT_POMODORO_CONFIG,
  }

  await chrome.storage.local.set({
    [STORAGE_KEYS.POMODORO_STATUS]: idleStatus,
  })

  await chrome.alarms.clear(ALARM_NAMES.POMODORO)
  await disablePomodoroBlocking()

  console.log("[v0] Pomodoro stopped")
}

async function handlePomodoroAlarm() {
  const { [STORAGE_KEYS.POMODORO_STATUS]: status } = await chrome.storage.local.get(STORAGE_KEYS.POMODORO_STATUS)

  if (!status) return

  if (status.state === "FOCUS") {
    // Transition to break
    const isLongBreak = status.currentCycle % status.config.cyclesBeforeLongBreak === 0
    const breakMinutes = isLongBreak ? status.config.longBreakMinutes : status.config.breakMinutes

    const newStatus: PomodoroStatus = {
      state: "BREAK",
      timeRemaining: breakMinutes * 60,
      currentCycle: status.currentCycle,
      config: status.config,
    }

    await chrome.storage.local.set({
      [STORAGE_KEYS.POMODORO_STATUS]: newStatus,
    })

    await chrome.alarms.create(ALARM_NAMES.POMODORO, {
      delayInMinutes: breakMinutes,
    })

    // Disable blocking during break
    await disablePomodoroBlocking()

    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "Pausa!",
      message: `Descanse por ${breakMinutes} minutos. Você merece!`,
    })

    console.log("[v0] Pomodoro: Focus → Break")
  } else if (status.state === "BREAK") {
    // Check for adaptive progression
    if (status.config.adaptiveMode && status.currentCycle % status.config.cyclesBeforeLongBreak === 0) {
      // Increase focus time by 5 minutes after completing a full cycle
      status.config.focusMinutes += 5
      console.log("[v0] Adaptive mode: Focus time increased to", status.config.focusMinutes)
    }

    // Return to idle, user must manually start next session
    const idleStatus: PomodoroStatus = {
      state: "IDLE",
      timeRemaining: 0,
      currentCycle: status.currentCycle,
      config: status.config,
    }

    await chrome.storage.local.set({
      [STORAGE_KEYS.POMODORO_STATUS]: idleStatus,
    })

    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "Ciclo Completo!",
      message: "Pronto para outra sessão de foco?",
    })

    console.log("[v0] Pomodoro: Break → Idle")
  }
}
