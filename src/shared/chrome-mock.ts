declare const chrome: any
export const isChromeExtension = typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id

// Generate mock daily usage data for the last 7 days
const generateMockDailyUsage = () => {
  const usage: Record<string, Record<string, number>> = {}
  const today = new Date()

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]

    usage[dateStr] = {
      "github.com": Math.floor(Math.random() * 7200) + 3600,
      "youtube.com": Math.floor(Math.random() * 3600) + 1800,
      "facebook.com": Math.floor(Math.random() * 1800) + 900,
      "twitter.com": Math.floor(Math.random() * 1200) + 600,
      "reddit.com": Math.floor(Math.random() * 2400) + 1200,
    }
  }

  return usage
}

export const createStorageChangeListener = () => {
  const listeners = new Set<(changes: any, areaName: string) => void>();
  return {
    addListener: (callback: (changes: any, areaName: string) => void) => {
      listeners.add(callback);
    },
    removeListener: (callback: (changes: any, areaName: string) => void) => {
      listeners.delete(callback);
    },
    hasListener: (callback: (changes: any, areaName: string) => void) => {
      return listeners.has(callback);
    },
    emit: (changes: any, areaName: string) => {
      listeners.forEach(listener => listener(changes, areaName));
    }
  };
};

export const chromeAPI = isChromeExtension
  ? chrome
  : {
      runtime: {
        onMessage: createStorageChangeListener(),
        sendMessage: async (message: any) => {
          console.log("[v0] Mock chrome.runtime.sendMessage:", message)
          return {
            blacklist: ["facebook.com", "twitter.com", "youtube.com"],
            timeLimits: [
              { domain: "reddit.com", limitMinutes: 30 },
              { domain: "instagram.com", limitMinutes: 20 },
            ],
            dailyUsage: generateMockDailyUsage(),
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
          onChanged: createStorageChangeListener(),
          get: async (keys?: string | string[] | Record<string, any>) => {
            console.log("[v0] Mock chrome.storage.local.get:", keys)
            // Return mock data based on requested keys
            const mockData: Record<string, any> = {
              dailyUsage: generateMockDailyUsage(),
              blacklist: ["facebook.com", "twitter.com", "youtube.com"],
              timeLimits: {
                "reddit.com": 1800,
                "instagram.com": 1200,
              },
            }

            if (typeof keys === "string") {
              return { [keys]: mockData[keys] }
            } else if (Array.isArray(keys)) {
              const result: Record<string, any> = {}
              keys.forEach((key) => {
                result[key] = mockData[key]
              })
              return result
            } else if (keys && typeof keys === "object") {
              const result: Record<string, any> = {}
              Object.keys(keys).forEach((key) => {
                result[key] = mockData[key] ?? keys[key]
              })
              return result
            }
            return mockData
          },
          set: async (items: Record<string, any>) => {
            console.log("[v0] Mock chrome.storage.local.set:", items)
          },
        },
        sync: {
          onChanged: createStorageChangeListener(),
          get: async (keys?: string | string[] | Record<string, any>) => {
            console.log("[v0] Mock chrome.storage.sync.get:", keys)
            const mockData: Record<string, any> = {
              blacklist: ["facebook.com", "twitter.com", "youtube.com"],
              timeLimits: [
                { domain: "reddit.com", limitMinutes: 30 },
                { domain: "instagram.com", limitMinutes: 20 },
              ],
              siteCustomizations: {
                "youtube.com": {
                  hideHomepage: false,
                  hideShorts: true,
                  hideComments: true,
                  hideRecommendations: false,
                },
              },
              settings: {
                theme: "dark",
                language: "pt",
                notificationsEnabled: true,
                dailySummary: false,
              },
            }

            if (typeof keys === "string") {
              return { [keys]: mockData[keys] }
            } else if (Array.isArray(keys)) {
              const result: Record<string, any> = {}
              keys.forEach((key) => {
                result[key] = mockData[key]
              })
              return result
            } else if (keys && typeof keys === "object") {
              const result: Record<string, any> = {}
              Object.keys(keys).forEach((key) => {
                result[key] = mockData[key] ?? keys[key]
              })
              return result
            }
            return mockData
          },
          set: async (items: Record<string, any>) => {
            console.log("[v0] Mock chrome.storage.sync.set:", items)
          },
        },
      },
    }
