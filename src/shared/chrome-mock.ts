declare const chrome: any
export const isChromeExtension = typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id

export const chromeAPI = isChromeExtension
  ? chrome
  : {
      runtime: {
        sendMessage: async (message: any) => {
          console.log("[v0] Mock chrome.runtime.sendMessage:", message)
          // Return mock data for demo
          return {
            blacklist: ["facebook.com", "twitter.com", "youtube.com"],
            timeLimits: [
              { domain: "reddit.com", limitMinutes: 30 },
              { domain: "instagram.com", limitMinutes: 20 },
            ],
            dailyUsage: {
              "facebook.com": 1800,
              "youtube.com": 3600,
              "twitter.com": 900,
              "github.com": 7200,
            },
            pomodoro: {
              state: "IDLE",
              timeRemaining: 0,
              currentCycle: 0,
              config: {
                focusMinutes: 25,
                breakMinutes: 5,
                longBreakMinutes: 15,
                cyclesBeforeLongBreak: 4,
                adaptiveMode: false,
              },
            },
            zenModePresets: [],
            settings: {
              analyticsConsent: false,
              productiveKeywords: ["tutorial", "documentation", "study", "learn"],
              distractingKeywords: ["news", "entertainment", "game", "social"],
              notificationsEnabled: true,
            },
          }
        },
      },
      storage: {
        local: {
          get: async () => ({}),
          set: async () => {},
        },
        sync: {
          get: async () => ({}),
          set: async () => {},
        },
      },
    }
