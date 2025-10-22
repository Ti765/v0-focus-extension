"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { normalizeDomain } from "../../shared/url";
import { useStore } from "../store";

export default function BlacklistManager() {
  const { blacklist, addToBlacklist, removeFromBlacklist, error, setError } = useStore(
    (s) => ({
      blacklist: s.blacklist,
      addToBlacklist: s.addToBlacklist,
      removeFromBlacklist: s.removeFromBlacklist,
      error: s.error,
      setError: s.setError,
    })
  );

  const [newDomain, setNewDomain] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleAdd() {
    if (submitting) return;

    const raw = newDomain.trim();
    if (!raw) return;

    const domain = normalizeDomain(raw);
    if (!domain) {
      setError("Domínio inválido. Ex.: exemplo.com");
      return;
    }

    // evita chamada redundante
    if (blacklist.some((e) => e.domain === domain)) {
      setError(`${domain} já está na lista.`);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await addToBlacklist(domain); // STATE_UPDATED atualizará a lista
      setNewDomain("");
    } catch (e: any) {
      console.error("[v0] UI: erro ao adicionar à blacklist:", e);
      // store already sets a user-friendly error
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(domain: string) {
    if (submitting) return;
    try {
      setSubmitting(true);
      setError(null);
      await removeFromBlacklist(domain); // STATE_UPDATED atualizará a lista
    } catch (e: any) {
      console.error("[v0] UI: erro ao remover da blacklist:", e);
    } finally {
      setSubmitting(false);
    }
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleAdd();
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
          Sites Bloqueados
        </h3>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {blacklist.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">Nenhum site bloqueado ainda</p>
            </div>
          ) : (
            blacklist.map((entry) => (
              <div
                key={entry.domain}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate font-mono">
                    {entry.domain}
                  </p>
                  {typeof entry.addedAt === "number" && entry.addedAt > 0 && (
                    <p className="text-xs text-gray-500">
                      {new Date(entry.addedAt).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleRemove(entry.domain)}
                  disabled={submitting}
                  className="ml-2 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-60"
                  aria-label={`Remover ${entry.domain} da lista`}
                  title="Remover"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newDomain}
            onChange={(e) => {
              setNewDomain(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={onInputKeyDown}
            placeholder="exemplo.com"
            className={`flex-1 px-3 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500/50 ${
              error ? "border-red-500/50" : "border-white/10"
            }`}
            aria-label="Adicionar domínio à blacklist"
            aria-invalid={!!error}
            aria-describedby={error ? "blacklist-error" : undefined}
            disabled={submitting}
          />
          <button
            onClick={handleAdd}
            disabled={submitting}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-60"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </button>
        </div>

        {error && (
          <p id="blacklist-error" className="text-xs text-red-400 mt-1">
            {error}
          </p>
        )}
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <p className="text-xs text-blue-300">
          💡 Sites bloqueados são impedidos de carregar e também durante sessões de foco (Pomodoro).
        </p>
      </div>
    </div>
  );
}
