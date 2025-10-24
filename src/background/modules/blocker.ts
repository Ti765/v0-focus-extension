import { STORAGE_KEYS } from "../../shared/constants";
import type { BlacklistEntry, Domain } from "../../shared/types";
import { notifyStateUpdate } from "./message-handler";
import { normalizeDomain } from "../../shared/url";
import { createDomainRegexPattern } from "../../shared/regex-utils";

// Flag de debug para logs detalhados do DNR
const DEBUG_DNR = true;

const POMODORO_RULE_ID_START = 1000;
const USER_BLACKLIST_RULE_ID_START = 2000;
const USER_BLACKLIST_RANGE = 1000; // IDs 2000..2999 reservados para a blacklist do usuário

// ---- Util: fila simples para evitar corridas no DNR ----
let dnrQueue: Promise<any> = Promise.resolve();
function withDnrLock<T>(fn: () => Promise<T>): Promise<T> {
  dnrQueue = dnrQueue.then(fn, fn);
  return dnrQueue as Promise<T>;
}

// ---- Util: gera ID determinístico no range 2000..2999 ----
function generateRuleIdForDomain(domain: string): number {
  // hash simples, determinístico
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    const c = domain.charCodeAt(i);
    hash = (hash << 5) - hash + c;
    hash |= 0; // 32 bits
  }
  const offset = Math.abs(hash) % USER_BLACKLIST_RANGE;
  return USER_BLACKLIST_RULE_ID_START + offset;
}

// ---- API pública ----

export async function initializeBlocker() {
  console.log("[v0] Initializing blocker module");
  await syncUserBlacklistRules();
}

export async function addToBlacklist(domain: string) {
  const storageData = (await chrome.storage.local.get(
    STORAGE_KEYS.BLACKLIST
  )) as { [key: string]: BlacklistEntry[] };

  const blacklist = storageData[STORAGE_KEYS.BLACKLIST] ?? [];
  const normalized = normalizeDomain(domain);
  if (!normalized) return;

  if (blacklist.some((e) => e.domain === normalized)) {
    console.log("[v0] Domain already in blacklist:", normalized);
    return;
  }

  const brandDomain = (d: string) => d as Domain;
  const updated: BlacklistEntry[] = [
    ...blacklist,
    { domain: brandDomain(normalized), addedAt: new Date().toISOString() },
  ];

  // If nothing changed (defensive), avoid writing and broadcasting
  try {
    const prev = blacklist;
    // shallow/structural check: length and domains
    const same = prev.length === updated.length && prev.every((v, i) => v.domain === updated[i].domain && v.addedAt === updated[i].addedAt);
    if (same) {
      console.log("[v0] addToBlacklist: no-op, blacklist identical");
      return;
    }
  } catch (e) {
    // ignore and proceed to write
  }

  await chrome.storage.local.set({ [STORAGE_KEYS.BLACKLIST]: updated });
  await syncUserBlacklistRules();
  await notifyStateUpdate();
  console.log("[v0] Added to blacklist:", normalized);
}

export async function removeFromBlacklist(domain: string) {
  const storageData = (await chrome.storage.local.get(
    STORAGE_KEYS.BLACKLIST
  )) as { [key: string]: BlacklistEntry[] };

  const blacklist = storageData[STORAGE_KEYS.BLACKLIST] ?? [];
  const normalized = normalizeDomain(domain);
  if (!normalized) return;

  const updated = blacklist.filter((e) => e.domain !== normalized);
  if (updated.length === blacklist.length) {
    // nada para remover
    return;
  }
  // If update didn't change content in a material way, skip writing
  try {
    const same = updated.length === blacklist.length && updated.every((v, i) => v.domain === blacklist[i].domain && v.addedAt === blacklist[i].addedAt);
    if (same) {
      console.log("[v0] removeFromBlacklist: no-op, blacklist identical");
      return;
    }
  } catch (e) {
    // ignore and proceed
  }

  await chrome.storage.local.set({ [STORAGE_KEYS.BLACKLIST]: updated });
  await syncUserBlacklistRules();
  await notifyStateUpdate();
  console.log("[v0] Removed from blacklist:", normalized);
}

// ---- Sincroniza APENAS as regras da blacklist do usuário (range 2000..2999) ----
async function syncUserBlacklistRules() {
  const { [STORAGE_KEYS.BLACKLIST]: blacklist = [] } = await chrome.storage.local.get(
    STORAGE_KEYS.BLACKLIST
  );

  return withDnrLock(async () => {
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();

    // IDs já usados pela blacklist do usuário
    const existingUserRuleIds = new Set(
      existingRules
        .map((r) => r.id)
        .filter(
          (id) =>
            id >= USER_BLACKLIST_RULE_ID_START &&
            id < USER_BLACKLIST_RULE_ID_START + USER_BLACKLIST_RANGE
        )
    );

    const rulesToAdd: chrome.declarativeNetRequest.Rule[] = [];
    const finalRuleIds = new Set<number>(); // IDs planejados nesta sincronização

    // Monta o conjunto final (domínios -> IDs únicos) com resolução simples de colisão
    for (const entry of blacklist as BlacklistEntry[]) {
      const d = normalizeDomain(entry.domain);
      if (!d) continue;

        let id = generateRuleIdForDomain(d);
        let attempts = 0;
        const maxRetries = USER_BLACKLIST_RANGE;

        // resolve colisão local/atual: incrementa e faz wrap no range
        while (finalRuleIds.has(id) || existingUserRuleIds.has(id)) {
          attempts++;
          if (attempts >= maxRetries) {
            console.error(
              `[v0] Rule ID range exhausted for domain: ${d}. ` +
              `Consider increasing USER_BLACKLIST_RANGE or cleaning old rules.`
            );
            break; // Sai do while sem adicionar regra
          }

          id++;
          if (id >= USER_BLACKLIST_RULE_ID_START + USER_BLACKLIST_RANGE) {
            id = USER_BLACKLIST_RULE_ID_START;
          }
        }

        // Se saiu por esgotamento, não adicione a regra
        if (attempts >= maxRetries) {
          console.warn(`[v0] Skipping rule for ${d} - no free ID found`);
          continue; // Próximo domínio
        }

        finalRuleIds.add(id);

      // Adiciona a regra se esse ID ainda não existe atualmente
      if (!existingUserRuleIds.has(id)) {
        // Usa regexFilter para casar tanto domínio raiz quanto subdomínios em http/https
        const regex = createDomainRegexPattern(d);
        rulesToAdd.push({
          id,
          priority: 1,
          action: {
            type: chrome.declarativeNetRequest.RuleActionType.BLOCK,
          },
          condition: {
            regexFilter: regex,
            isUrlFilterCaseSensitive: false,
            resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
          },
        });
      }
    }

    // Regras a remover: IDs do range 2000..2999 que não estão mais no conjunto final
    const rulesToRemove = Array.from(existingUserRuleIds).filter(
      (id) => !finalRuleIds.has(id)
    );

    if (rulesToAdd.length > 0 || rulesToRemove.length > 0) {
      if (DEBUG_DNR) {
        console.log("[DNR-DEBUG] Blacklist domains:", blacklist.map((e: any) => e.domain));
        console.log("[DNR-DEBUG] Rules to add (with regex):", rulesToAdd.map(r => ({
          id: r.id,
          regex: r.condition.regexFilter,
          domain: blacklist.find((e: any) => generateRuleIdForDomain(e.domain) === r.id)?.domain
        })));
        console.log("[DNR-DEBUG] Rules to remove IDs:", rulesToRemove);
      }
      
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: rulesToRemove,
        addRules: rulesToAdd,
      });
      
      if (DEBUG_DNR) {
        const allRules = await chrome.declarativeNetRequest.getDynamicRules();
        console.log("[DNR-DEBUG] All dynamic rules after sync:", allRules);
        console.log("[DNR-DEBUG] Total rules count:", allRules.length);
        console.log("[DNR-DEBUG] Rules by type:", {
          pomodoro: allRules.filter(r => r.id >= POMODORO_RULE_ID_START && r.id < USER_BLACKLIST_RULE_ID_START).length,
          blacklist: allRules.filter(r => r.id >= USER_BLACKLIST_RULE_ID_START && r.id < USER_BLACKLIST_RULE_ID_START + USER_BLACKLIST_RANGE).length,
          other: allRules.filter(r => r.id < POMODORO_RULE_ID_START || r.id >= USER_BLACKLIST_RULE_ID_START + USER_BLACKLIST_RANGE).length
        });
      }
      
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

// ---- Bloqueio de Pomodoro (range 1000..1999) ----

export async function enablePomodoroBlocking() {
  const { [STORAGE_KEYS.BLACKLIST]: blacklist = [] } = await chrome.storage.local.get(
    STORAGE_KEYS.BLACKLIST
  );
  if (!Array.isArray(blacklist) || blacklist.length === 0) {
    console.log("[v0] No sites in blacklist to block for Pomodoro.");
    return;
  }

  const pomodoroRules: chrome.declarativeNetRequest.Rule[] = (blacklist as BlacklistEntry[]).map(
    (entry, index) => {
      const d = normalizeDomain(entry.domain);
      const regex = createDomainRegexPattern(d);
      return {
        id: POMODORO_RULE_ID_START + index, // sequência simples e previsível
        priority: 2, // acima das regras de usuário
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.BLOCK,
        },
        condition: {
          // Bloqueia navegações para o domínio (e subdomínios)
          regexFilter: regex,
          isUrlFilterCaseSensitive: false,
          resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
        },
      } as chrome.declarativeNetRequest.Rule;
    }
  );

  return withDnrLock(async () => {
    const existing = await chrome.declarativeNetRequest.getDynamicRules();
    const oldPomodoroIds = existing
      .map((r) => r.id)
      .filter((id) => id >= POMODORO_RULE_ID_START && id < USER_BLACKLIST_RULE_ID_START);

    console.log("[v0] [DEBUG] Pomodoro rules to add:", JSON.stringify(pomodoroRules, null, 2));
    
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: oldPomodoroIds,
      addRules: pomodoroRules,
    });
    
    const allRules = await chrome.declarativeNetRequest.getDynamicRules();
    console.log("[v0] [DEBUG] All dynamic rules after Pomodoro enable:", JSON.stringify(allRules, null, 2));

    console.log(
      "[v0] Enabling Pomodoro blocking for",
      blacklist.length,
      "sites."
    );
  });
}

export async function disablePomodoroBlocking() {
  return withDnrLock(async () => {
    const existing = await chrome.declarativeNetRequest.getDynamicRules();
    const pomodoroRuleIds = existing
      .map((r) => r.id)
      .filter((id) => id >= POMODORO_RULE_ID_START && id < USER_BLACKLIST_RULE_ID_START);

    if (pomodoroRuleIds.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: pomodoroRuleIds,
      });
      console.log(
        "[v0] Pomodoro blocking disabled. Removed",
        pomodoroRuleIds.length,
        "rules."
      );
    }
  });
}
