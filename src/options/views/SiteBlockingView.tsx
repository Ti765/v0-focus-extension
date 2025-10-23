import { useEffect, useRef, useState } from "react";
import { Youtube, Plus, Trash2 } from "lucide-react";
import { chromeAPI } from "../../shared/chrome-mock";
import { deepEqual } from "../../shared/utils";
import { normalizeDomain } from "../../shared/url";
import type { BlacklistEntry } from "../../shared/types";

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

// Converte qualquer formato vindo do storage para string[]
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
  const [customizations, setCustomizations] = useState<SiteCustomizations>({});
  const [blockedSites, setBlockedSites] = useState<string[]>([]);
  const [newSite, setNewSite] = useState("");

  // flags/refs por-instância (não globais)
  const ignoreNextChange = useRef(false);
  const blockedRef = useRef<string[]>([]);
  const customRef = useRef<SiteCustomizations>({});

  useEffect(() => { blockedRef.current = blockedSites; }, [blockedSites]);
  useEffect(() => { customRef.current = customizations; }, [customizations]);

  // Carrega estado inicial
  useEffect(() => { void loadData(); }, []);
  async function loadData() {
    try {
      const { siteCustomizations } =
        (await chromeAPI?.storage?.local?.get("siteCustomizations")) ?? {};
      const { blacklist } =
        (await chromeAPI?.storage?.local?.get("blacklist")) ?? {};

      setCustomizations(siteCustomizations ?? {});
      setBlockedSites(toDomains(blacklist));
    } catch (e) {
      console.warn("[v0] SiteBlockingView loadData failed", e);
    }
  }

  // Escuta mudanças externas do storage.local (eco controlado só para customizations)
  useEffect(() => {
    if (!chromeAPI?.storage?.onChanged?.addListener) return;

    const handler = (
      changes: Record<string, { oldValue?: unknown; newValue?: unknown }>,
      area: string
    ) => {
      if (area !== "local") return;

      // Blacklist: nunca gravamos localmente aqui, então só converge
      if (changes.blacklist) {
        const next = toDomains(changes.blacklist.newValue);
        if (!deepEqual(next, blockedRef.current)) setBlockedSites(next);
      }

      // Customizações: podemos ter acabado de gravar localmente → consumir eco 1x
      if (changes.siteCustomizations) {
        if (ignoreNextChange.current) {
          ignoreNextChange.current = false;
        } else {
          const nextC = (changes.siteCustomizations.newValue as SiteCustomizations) ?? {};
          if (!deepEqual(nextC, customRef.current)) setCustomizations(nextC);
        }
      }
    };

    chromeAPI.storage.onChanged.addListener(handler);
    return () => chromeAPI.storage.onChanged.removeListener(handler);
  }, []);

  // ===== AÇÕES =====

  // Customizações YT: grava local só aqui (nada de useEffect que regrava/enviar msg)
  const updateYouTubeSetting = async (key: keyof YouTubeCustomization, value: boolean) => {
    const yt = { ...DEFAULT_YT, ...(customRef.current["youtube.com"] ?? {}) };
    const updatedYT: YouTubeCustomization = { ...yt, [key]: value };
    const updated: SiteCustomizations = { ...customRef.current, "youtube.com": updatedYT };
    if (deepEqual(updated, customRef.current)) return;

    try {
      ignoreNextChange.current = true; // consumir o onChanged desta escrita
      await chromeAPI.storage.local.set({ siteCustomizations: updated });
    } catch { /* noop */ }
    setCustomizations(updated);

    // (Opcional) avisar o SW se ele usar customizations para algo
    try {
      await chromeAPI.runtime.sendMessage?.({ type: "UPDATE_CUSTOMIZATIONS", payload: updated });
    } catch { /* noop */ }
  };

  // Blacklist: NUNCA grava localmente aqui; somente avisa o SW e atualiza otimistamente
  const addBlockedSite = async () => {
    const normalized = normalizeDomain(newSite);
    if (!normalized) return;

    const next = Array.from(new Set([...blockedRef.current, normalized]));
    if (!deepEqual(next, blockedRef.current)) setBlockedSites(next);
    setNewSite("");

    try {
      await chromeAPI.runtime.sendMessage({
        type: "ADD_TO_BLACKLIST",
        payload: { domain: normalized }
      });
    } catch {
      // se falhar, re-sincroniza com a fonte de verdade
      void loadData();
    }
  };

  const removeBlockedSite = async (domain: string) => {
    const next = blockedRef.current.filter((d) => d !== domain);
    if (!deepEqual(next, blockedRef.current)) setBlockedSites(next);

    try {
      await chromeAPI.runtime.sendMessage({
        type: "REMOVE_FROM_BLACKLIST",
        payload: { domain }
      });
    } catch {
      void loadData();
    }
  };

  const ytSettings: YouTubeCustomization = {
    ...DEFAULT_YT,
    ...(customizations["youtube.com"] ?? {}),
  };

  const toggleOptions: Array<{ key: keyof YouTubeCustomization; label: string; icon: string }> = [
    { key: "hideHomepage", label: "Ocultar Página Inicial", icon: "🏠" },
    { key: "hideShorts", label: "Ocultar Shorts", icon: "📱" },
    { key: "hideComments", label: "Ocultar Comentários", icon: "💬" },
    { key: "hideRecommendations", label: "Ocultar Vídeos Recomendados", icon: "📺" },
  ];

  // ===== UI =====
  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="text-3xl font-bold text-white mb-2">Bloqueio de Sites e Elementos</h2>
        <p className="text-gray-400">Controle total sobre distrações online</p>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Sites Bloqueados</h3>
        <div className="space-y-2 mb-4">
          {blockedSites.map((site) => (
            <div key={site} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
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
          {blockedSites.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum site bloqueado ainda</p>
            </div>
          )}
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

      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-red-500/20 rounded-lg"><Youtube className="w-6 h-6 text-red-400" /></div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white">Personalização de Sites</h3>
            <p className="text-sm text-gray-400">YouTube</p>
          </div>
        </div>

        <div className="space-y-3">
          {toggleOptions.map((option) => (
            <div key={option.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{option.icon}</span>
                <span className="text-white font-medium">{option.label}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!ytSettings[option.key]}
                  onChange={(e) => updateYouTubeSetting(option.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                <span className="ml-3 text-sm text-gray-400">{ytSettings[option.key] ? "On" : "Off"}</span>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
