// src/options/SiteBlockingView.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Youtube, Plus, Trash2 } from "lucide-react";

import { chromeAPI } from "../../shared/chrome-mock";
import debug from "../../lib/debug";
import { deepEqual } from "../../shared/utils";
import { normalizeDomain } from "../../shared/url";
import type { 
  BlacklistEntry, 
  Message,
  MessageId
} from "../../shared/types";

/**
 * Customizações específicas para YouTube na UI do painel.
 * Mantemos localmente e enviamos ao SW para persistência.
 */
interface YouTubeCustomization {
  hideHomepage: boolean;
  hideShorts: boolean;
  hideComments: boolean;
  hideRecommendations: boolean;
}
type SiteCustomizations = Record<string, YouTubeCustomization>;

const DEFAULT_YT: YouTubeCustomization = {
  hideHomepage: false,
  hideShorts: false,
  hideComments: false,
  hideRecommendations: false,
};

/** Converte valores vindos do storage para array de domínios */
function toDomains(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item === "string" && item) out.push(item);
    else if (item && typeof item === "object" && "domain" in (item as any)) {
      const d = (item as BlacklistEntry).domain;
      if (typeof d === "string" && d) out.push(d);
    }
  }
  return Array.from(new Set(out));
}

export default function SiteBlockingView(): JSX.Element {
  // --- estado local (somente leitura de storage; escrita via SW) ---
  const [blockedSites, setBlockedSites] = useState<string[]>([]);
  const [customizations, setCustomizations] = useState<SiteCustomizations>({});
  const [newSite, setNewSite] = useState("");

  // --- refs para comparações estáveis e guards de concorrência ---
  const blockedRef = useRef<string[]>([]);
  const customRef = useRef<SiteCustomizations>({});
  const sendingRef = useRef(false); // trava rápida para evitar rajadas de envios

  useEffect(() => {
    blockedRef.current = blockedSites;
  }, [blockedSites]);
  useEffect(() => {
    customRef.current = customizations;
  }, [customizations]);

  // --- carga inicial direto do storage ---
  useEffect(() => {
    (async () => {
      try {
        const { blacklist } =
          (await chromeAPI?.storage?.local?.get("blacklist")) ?? {};
        const { siteCustomizations } =
          (await chromeAPI?.storage?.local?.get("siteCustomizations")) ?? {};
  // debug
  debug('[dbg] SiteBlockingView initial load blacklist:', blacklist);
  debug('[dbg] SiteBlockingView initial load siteCustomizations:', siteCustomizations);
        setBlockedSites(toDomains(blacklist));
        setCustomizations((siteCustomizations as SiteCustomizations) ?? {});
      } catch (e) {
        console.warn("[SiteBlockingView] initial load failed", e);
      }
    })();
  }, []);

  // --- ouvir storage.onChanged (UI não grava, então não há eco) ---
  useEffect(() => {
    if (!chromeAPI?.storage?.onChanged?.addListener) return;

    const handler = (
      changes: Record<string, { oldValue?: unknown; newValue?: unknown }>,
      area: string
    ) => {
      if (area !== "local") return;

      if (changes.blacklist) {
        const next = toDomains(changes.blacklist.newValue);
  debug('[dbg] SiteBlockingView storage.onChanged blacklist:', changes.blacklist);
        if (!deepEqual(next, blockedRef.current)) setBlockedSites(next);
      }
      if (changes.siteCustomizations) {
        const next = (changes.siteCustomizations.newValue ??
          {}) as SiteCustomizations;
  debug('[dbg] SiteBlockingView storage.onChanged siteCustomizations:', changes.siteCustomizations);
        if (!deepEqual(next, customRef.current)) setCustomizations(next);
      }
    };

    chromeAPI.storage.onChanged.addListener(handler);
    return () => chromeAPI.storage.onChanged.removeListener(handler);
  }, []);

  // --- ações: sempre mandar mensagem ao SW; nada de storage.set na UI ---

  async function sendMessage<T = any>(msg: Message): Promise<T | void> {
    // Usar promise/lastError de acordo com MV3; SW deve dar return true p/ async. :contentReference[oaicite:2]{index=2}
    return new Promise((resolve, reject) => {
      try {
        chromeAPI.runtime.sendMessage(msg as any, (response: T) => {
          const err = (chromeAPI.runtime as any).lastError;
          if (err) return reject(new Error(err.message));
          resolve(response);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async function addBlockedSite() {
    const normalized = normalizeDomain(newSite.trim());
    if (!normalized) return;

    // otimista (UI) + evita duplicar
    const next = Array.from(new Set([...blockedRef.current, normalized]));
    if (!deepEqual(next, blockedRef.current)) setBlockedSites(next);
    setNewSite("");

    if (sendingRef.current) return;
    sendingRef.current = true;
      try {
  debug('[dbg] SiteBlockingView.addBlockedSite -> sendMessage', { type: 'ADD_TO_BLACKLIST', payload: { domain: normalized }, skipNotify: true });
      await sendMessage({
        type: "ADD_TO_BLACKLIST",
        payload: { domain: normalized },
        skipNotify: true,
      } as any);
      // atualização real virá via storage.onChanged
    } catch (e) {
      console.error("[SiteBlockingView] addBlockedSite failed", e);
      // fallback: recarrega estado do storage para garantir consistência
      try {
        const { blacklist } =
          (await chromeAPI?.storage?.local?.get("blacklist")) ?? {};
        setBlockedSites(toDomains(blacklist));
      } catch {}
    } finally {
      sendingRef.current = false;
    }
  }

  async function removeBlockedSite(domain: string) {
    const next = blockedRef.current.filter((d) => d !== domain);
    if (!deepEqual(next, blockedRef.current)) setBlockedSites(next);

    if (sendingRef.current) return;
    sendingRef.current = true;
    try {
  debug('[dbg] SiteBlockingView.removeBlockedSite -> sendMessage', { type: 'REMOVE_FROM_BLACKLIST', payload: { domain }, skipNotify: true });
      await sendMessage({
        type: "REMOVE_FROM_BLACKLIST",
        payload: { domain },
        skipNotify: true,
      } as any);
    } catch (e) {
      console.error("[SiteBlockingView] removeBlockedSite failed", e);
      try {
        const { blacklist } =
          (await chromeAPI?.storage?.local?.get("blacklist")) ?? {};
        setBlockedSites(toDomains(blacklist));
      } catch {}
    } finally {
      sendingRef.current = false;
    }
  }

  async function updateYouTubeSetting(
    key: keyof YouTubeCustomization,
    value: boolean
  ) {
    const current = customRef.current["youtube.com"] ?? DEFAULT_YT;
    const updatedYT: YouTubeCustomization = { ...current, [key]: value };
    const updated: SiteCustomizations = {
      ...customRef.current,
      "youtube.com": updatedYT,
    };

    if (deepEqual(updated, customRef.current)) return;

    // otimista (UI)
    setCustomizations(updated);

    if (sendingRef.current) return;
    sendingRef.current = true;
    try {
      await sendMessage({
        type: "SITE_CUSTOMIZATION_UPDATED",
        payload: { domain: "youtube.com", config: updatedYT },
        source: "panel-ui",
        id: crypto.randomUUID() as MessageId,
        ts: Date.now(),
      });
    } catch (e) {
      console.error("[SiteBlockingView] updateYouTubeSetting failed", e);
      // rollback simples consultando o storage
      try {
        const { siteCustomizations } =
          (await chromeAPI?.storage?.local?.get("siteCustomizations")) ?? {};
        setCustomizations((siteCustomizations as SiteCustomizations) ?? {});
      } catch {}
    } finally {
      sendingRef.current = false;
    }
  }

  // --- dados derivados para render ---
  const ytSettings: YouTubeCustomization = {
    ...DEFAULT_YT,
    ...(customizations["youtube.com"] ?? {}),
  };

  const toggleOptions: Array<{
    key: keyof YouTubeCustomization;
    label: string;
    icon: string;
  }> = [
    { key: "hideHomepage", label: "Ocultar Página Inicial", icon: "🏠" },
    { key: "hideShorts", label: "Ocultar Shorts", icon: "📱" },
    { key: "hideComments", label: "Ocultar Comentários", icon: "💬" },
    { key: "hideRecommendations", label: "Ocultar Recomendados", icon: "📺" },
  ];

  // --- UI ---
  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="text-3xl font-bold text-white mb-2">
          Bloqueio de Sites e Elementos
        </h2>
        <p className="text-gray-400">Controle total sobre distrações online</p>
      </div>

      {/* Blacklist */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Sites Bloqueados</h3>

        <div className="space-y-2 mb-4">
          {blockedSites.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum site bloqueado ainda</p>
            </div>
          )}

          {blockedSites.map((site) => (
            <div
              key={site}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
            >
              <span className="text-white font-mono text-sm">{site}</span>
              <button
                onClick={() => removeBlockedSite(site)}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                aria-label={`Remover ${site}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="exemplo.com"
            value={newSite}
            onChange={(e) => setNewSite(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addBlockedSite()}
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
          />
          <button
            onClick={addBlockedSite}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            Adicionar
          </button>
        </div>
      </div>

      {/* Customização YouTube */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-red-500/20 rounded-lg">
            <Youtube className="w-6 h-6 text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white">
              Personalização de Sites
            </h3>
            <p className="text-sm text-gray-400">YouTube</p>
          </div>
        </div>

        <div className="space-y-3">
          {toggleOptions.map((option) => (
            <div
              key={option.key}
              className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{option.icon}</span>
                <span className="text-white font-medium">{option.label}</span>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!ytSettings[option.key]}
                  onChange={(e) =>
                    updateYouTubeSetting(option.key, e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 transition-colors" />
                <span className="ml-3 text-sm text-gray-300">
                  {ytSettings[option.key] ? "Ativado" : "Desativado"}
                </span>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
