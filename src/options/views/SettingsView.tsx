import { useState, useEffect } from "react";
import { Bell, Globe, Palette, TestTube } from "lucide-react";
import type { UserSettings, AppState, Message, MessageId } from "../../shared/types";
import { MESSAGE } from "../../shared/types";
import { chromeAPI, isChromeExtension } from "../../shared/chrome-mock";
import { DEFAULT_SETTINGS } from "../../shared/constants";
import { useFirebaseUser } from "../../lib/firebase/useFirebaseUser";

declare const chrome: any;

function uuidv4Fallback(): string {
  if (globalThis.crypto && typeof globalThis.crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  }
  return `${Date.now()}-${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`;
}

function uuid(): string {
  return (globalThis.crypto?.randomUUID?.() ?? uuidv4Fallback());
}

export default function SettingsView() {
  const [settings, setSettings] = useState<UserSettings>({ ...DEFAULT_SETTINGS });
  const [initError, setInitError] = useState<null | Error>(null);
  const {
    user: firebaseUser,
    loading: authLoading,
    error: authError,
    signInWithGoogle,
    signOutFromGoogle,
  } = useFirebaseUser({ source: "panel-ui" });

  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendMessage<T = unknown>(msg: Omit<Message, "id" | "ts" | "source"> & Partial<Pick<Message, "source">>) {
    return new Promise<T>((resolve, reject) => {
      const envelope: Message = {
        ...(msg as any),
        id: uuid() as MessageId,
        ts: Date.now(),
        source: "panel-ui",
      };
      try {
        chromeAPI.runtime.sendMessage(envelope, (resp: T) => {
          const err = chromeAPI.runtime.lastError;
          if (err) return reject(new Error(err.message));
          resolve(resp);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  const loadSettings = async () => {
    try {
      const resp = (await sendMessage<AppState | { ok: boolean; data?: AppState }>({
        type: MESSAGE.GET_INITIAL_STATE,
      })) as any;

      const appState: AppState | undefined = resp?.ok ? resp?.data : resp;
      if (appState?.settings) {
        setSettings({ ...DEFAULT_SETTINGS, ...appState.settings });
        return;
      }
    } catch (err) {
      console.error("[SettingsView] failed to get initial state from service worker:", err);
      setInitError(err as Error);
    }

    try {
      const result = await chromeAPI.storage.sync.get("settings");
      if (result?.settings) {
        setSettings({ ...DEFAULT_SETTINGS, ...(result.settings || {}) });
      }
    } catch (e) {
      console.error("[SettingsView] failed to read settings from chrome.storage.sync fallback:", e);
      setInitError(e as Error);
    }
  };

  async function updateSetting<K extends keyof UserSettings>(key: K, value: UserSettings[K]) {
    const next: UserSettings = { ...settings, [key]: value };

    try {
      await sendMessage({
        type: MESSAGE.STATE_PATCH,
        payload: { patch: { settings: { [key]: value } } },
      });
    } catch {
      await chromeAPI.storage.sync.set({ settings: next });
    }

    setSettings(next);
  }

  const testNotification = async () => {
    if (isChromeExtension && typeof chrome !== "undefined" && chrome.notifications) {
      try {
        // Options page can't directly import background modules, so use chrome.runtime.getURL for icon
        const notificationId = `test-notification-${Date.now()}`;
        await chrome.notifications.create(notificationId, {
          type: "basic",
          iconUrl: chrome.runtime.getURL("icons/icon48.png"),
          title: "Teste de Notificação",
          message: "As notificações estão funcionando corretamente!",
        });
        console.log("[SettingsView] Test notification created:", notificationId);
      } catch (error: any) {
        console.error("[SettingsView] Failed to create test notification:", {
          error: error?.message || String(error),
          stack: error?.stack,
        });
        alert(`Erro ao criar notificação: ${error?.message || String(error)}`);
      }
    } else {
      alert("Teste de Notificação: As notificações estão funcionando corretamente!");
    }
  };

  const theme = settings.theme ?? "system";
  const language = settings.language ?? "pt";

  return (
    <div className="space-y-6">
      {initError ? (
        <div className="glass-card p-4 border border-red-600 bg-red-900/20 text-red-200 flex items-start justify-between">
          <div>
            <strong>Falha ao carregar o estado</strong>
            <div className="text-sm text-red-300 mt-1">{initError.message ?? String(initError)}</div>
          </div>
          <button
            onClick={() => setInitError(null)}
            className="ml-4 inline-flex items-center px-3 py-1 bg-red-700 hover:bg-red-600 rounded text-sm"
            aria-label="Fechar aviso de erro"
          >
            Fechar
          </button>
        </div>
      ) : null}
      <div className="glass-card p-6">
        <h2 className="text-3xl font-bold text-white mb-2">Configurações</h2>
        <p className="text-gray-400">Personalize sua experiência</p>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">GERAL</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-gray-400" />
              <span className="text-white font-medium">Tema</span>
            </div>
            <select
              value={theme}
              onChange={(e) => updateSetting("theme", e.target.value as UserSettings["theme"]) }
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
            >
              <option value="system">Seguir Navegador</option>
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-gray-400" />
              <span className="text-white font-medium">Idioma</span>
            </div>
            <select
              value={language}
              onChange={(e) => updateSetting("language", e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
            >
              <option value="pt">Português</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
              SINCRONIZAÇÃO & PRIVACIDADE
            </h3>
            <p className="text-gray-400 text-sm">
              Processamos tudo localmente e só enviamos resumos agregados ao Firestore com seu consentimento.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex flex-col">
            <span className="text-white font-medium">Enviar resumos diários</span>
            <span className="text-xs text-gray-400">
              Inclui top sites, buscas categorizadas e minutos focados.
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={!!settings.analyticsConsent}
              onChange={(e) => updateSetting("analyticsConsent", e.target.checked as any)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm text-gray-400">
              {settings.analyticsConsent ? "Ativo" : "Desativado"}
            </span>
          </label>
        </div>

        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Conta Firebase</p>
              <p className="text-xs text-gray-400">
                {firebaseUser
                  ? firebaseUser.email || firebaseUser.displayName || "Conta conectada"
                  : "Conecte-se com Google para sincronizar com segurança."}
              </p>
            </div>
            <button
              onClick={() => (firebaseUser ? signOutFromGoogle() : signInWithGoogle())}
              disabled={authLoading || !settings.analyticsConsent}
              className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-500/30 rounded-lg text-sm text-blue-100 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {firebaseUser ? "Desconectar" : "Entrar com Google"}
            </button>
          </div>
          {authError ? <p className="text-xs text-red-400 mt-2">{authError}</p> : null}
          {!settings.analyticsConsent ? (
            <p className="text-xs text-yellow-400 mt-2">
              Ative o envio de resumos para liberar a sincronização.
            </p>
          ) : null}
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">NOTIFICAÇÕES</h3>

        <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-4">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-blue-300">Se você não concedeu permissão, teste as notificações</span>
          </div>
          <button
            onClick={testNotification}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <TestTube className="w-4 h-4" />
            Testar
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="text-white font-medium">Avisos de Limite de Bloqueio</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications ?? settings.notificationsEnabled ?? true}
                onChange={(e) => updateSetting("notifications", e.target.checked as any)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm text-gray-400">
                {(settings.notifications ?? settings.notificationsEnabled) ? "On" : "Off"}
              </span>
            </label>
          </div>

        </div>
      </div>
    </div>
  );
}