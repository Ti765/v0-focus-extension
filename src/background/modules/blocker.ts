import { STORAGE_KEYS } from "../../shared/constants";
import type { BlacklistEntry } from "../../shared/types";
import { notifyStateUpdate } from "./message-handler";
import { normalizeDomain } from "../../shared/url";

const POMODORO_RULE_ID_START = 1000;
const USER_BLACKLIST_RULE_ID_START = 2000;
const USER_BLACKLIST_RANGE = 1000; // 2000..2999

// Hash simples e estável
const baseIdForDomain = (domain: string) => {
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    const char = domain.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return USER_BLACKLIST_RULE_ID_START + (Math.abs(hash) % USER_BLACKLIST_RANGE);
};

// Fila para serializar updates DNR
let dnrQueue: Promise<any> = Promise.resolve();
function withDnrLock<T>(fn: () => Promise<T>): Promise<T> {
  dnrQueue = dnrQueue.then(fn, fn);
  return dnrQueue as Promise<T>;
}

export async function initializeBlocker() {
  console.log("[v0] Initializing blocker module");
  await syncUserBlacklistRules();
}

export async function addToBlacklist(domain: string) {
  const storageData = (await chrome.storage.local.get(STORAGE_KEYS.BLACKLIST)) as { [key: string]: BlacklistEntry[] };
  const blacklist = storageData[STORAGE_KEYS.BLACKLIST] ?? [];

  const d = normalizeDomain(domain);
  if (!d) return;

  if (blacklist.some((e) => e.domain === d)) {
    console.log("[v0] Domain already in blacklist:", d);
    return;
  }

  const updated = [...blacklist, { domain: d, addedAt: Date.now() } satisfies BlacklistEntry];
  await chrome.storage.local.set({ [STORAGE_KEYS.BLACKLIST]: updated });

  await syncUserBlacklistRules();
  await notifyStateUpdate();
  console.log("[v0] Added to blacklist:", d);
}

export async function removeFromBlacklist(domain: string) {
  const storageData = (await chrome.storage.local.get(STORAGE_KEYS.BLACKLIST)) as { [key: string]: BlacklistEntry[] };
  const blacklist = storageData[STORAGE_KEYS.BLACKLIST] ?? [];

  const d = normalizeDomain(domain);
  if (!d) return;

  const updated = blacklist.filter((e) => e.domain !== d);
  if (updated.length === blacklist.length) return;

  await chrome.storage.local.set({ [STORAGE_KEYS.BLACKLIST]: updated });
  await syncUserBlacklistRules();
  await notifyStateUpdate();
  console.log("[v0] Removed from blacklist:", d);
}

// Sincroniza APENAS as regras da blacklist do usuário
async function syncUserBlacklistRules() {
  const { [STORAGE_KEYS.BLACKLIST]: blacklist = [] } = await chrome.storage.local.get(STORAGE_KEYS.BLACKLIST);

  return withDnrLock(async () => {
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();

    // Regras do usuário na faixa 2000..2999
    const existingUserRules = existingRules.filter(
      (r) => r.id >= USER_BLACKLIST_RULE_ID_START && r.id < USER_BLACKLIST_RULE_ID_START + USER_BLACKLIST_RANGE
    );

    const existingIdSet = new Set(existingUserRules.map((r) => r.id));
    // Mapa para reaproveitar ID se já há uma regra para "||dominio"
    const urlFilterToId = new Map<string, number>();
    for (const r of existingUserRules) {
      const uf = r.condition?.urlFilter;
      if (uf) urlFilterToId.set(uf, r.id);
    }

    const finalIds = new Set<number>();
    const rulesToAdd: chrome.declarativeNetRequest.Rule[] = [];

    for (const entry of blacklist as BlacklistEntry[]) {
      const d = normalizeDomain(entry.domain);
      const uf = `||${d}`;

      // 1) Reusa ID se já existe regra para este domínio
      const reuseId = urlFilterToId.get(uf);
      if (reuseId != null) {
        finalIds.add(reuseId);
        continue; // já existe, nada a adicionar
      }

      // 2) Caso não exista, gera um novo ID livre
      let id = baseIdForDomain(d);
      // evita colisão com IDs existentes (atuais) e com os escolhidos nesta rodada
      while (existingIdSet.has(id) || finalIds.has(id)) {
        id++;
        if (id >= USER_BLACKLIST_RULE_ID_START + USER_BLACKLIST_RANGE) {
          id = USER_BLACKLIST_RULE_ID_START;
        }
        // Se o range estiver realmente todo ocupado, evita loop infinito
        if (finalIds.size >= USER_BLACKLIST_RANGE) {
          console.error("[v0] Blacklist rule ID range appears to be full. Skipping:", d);
          id = -1;
          break;
        }
      }

      if (id === -1) continue;

      finalIds.add(id);
      rulesToAdd.push({
        id,
        priority: 1,
        action: { type: "block" as chrome.declarativeNetRequest.RuleActionType },
        condition: {
          urlFilter: uf,
          resourceTypes: ["main_frame" as chrome.declarativeNetRequest.ResourceType],
        },
      });
    }

    // Regras a remover = regras do usuário que não aparecem mais no conjunto final
    const rulesToRemove = existingUserRules
      .map((r) => r.id)
      .filter((id) => !finalIds.has(id));

    if (rulesToAdd.length || rulesToRemove.length) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: rulesToRemove,
        addRules: rulesToAdd,
      });
      console.log(
        "[v0] User blocking rules synced:",
        rulesToAdd.length,
        "rules added,",
        rulesToRemove.length,
        "rules removed."
      );
    } else {
      console.log("[v0] User blocking rules already in sync.");
    }
  });
}

export async function enablePomodoroBlocking() {
  const { [STORAGE_KEYS.BLACKLIST]: blacklist = [] } = await chrome.storage.local.get(STORAGE_KEYS.BLACKLIST);
  if (!blacklist.length) {
    console.log("[v0] No sites in blacklist to block for Pomodoro.");
    return;
  }

  const pomodoroRules: chrome.declarativeNetRequest.Rule[] = (blacklist as BlacklistEntry[]).map((entry, index) => {
    const d = normalizeDomain(entry.domain);
    return {
      id: POMODORO_RULE_ID_START + index,
      priority: 2,
      action: { type: "block" as chrome.declarativeNetRequest.RuleActionType },
      condition: {
        urlFilter: `||${d}`,
        resourceTypes: ["main_frame" as chrome.declarativeNetRequest.ResourceType],
      },
    };
  });

  return withDnrLock(async () => {
    const existing = await chrome.declarativeNetRequest.getDynamicRules();
    const oldPomodoroIds = existing
      .map((r) => r.id)
      .filter((id) => id >= POMODORO_RULE_ID_START && id < USER_BLACKLIST_RULE_ID_START);

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: oldPomodoroIds,
      addRules: pomodoroRules,
    });

    console.log("[v0] Enabling Pomodoro blocking for", blacklist.length, "sites.");
  });
}

export async function disablePomodoroBlocking() {
  return withDnrLock(async () => {
    const existing = await chrome.declarativeNetRequest.getDynamicRules();
    const pomodoroIds = existing
      .map((r) => r.id)
      .filter((id) => id >= POMODORO_RULE_ID_START && id < USER_BLACKLIST_RULE_ID_START);

    if (pomodoroIds.length) {
      await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: pomodoroIds });
      console.log("[v0] Pomodoro blocking disabled. Removed", pomodoroIds.length, "rules.");
    }
  });
}
