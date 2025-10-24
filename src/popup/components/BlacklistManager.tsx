// src/popup/BlacklistManager.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { normalizeDomain } from "../../shared/url";
import { useStoreShallow } from "../store";
import debug from "../../lib/debug";

export default function BlacklistManager(): JSX.Element {
  // Seleciona apenas o que a UI precisa, com shallow compare para evitar rerenders desnecessários
  const { blacklist, addToBlacklist, removeFromBlacklist, error, setError } =
    useStoreShallow((s) => ({
      blacklist: s.blacklist,
      addToBlacklist: s.addToBlacklist,
      removeFromBlacklist: s.removeFromBlacklist,
      error: s.error,
      setError: s.setError,
    }));

  const [newDomain, setNewDomain] = useState("");
  const sendingRef = useRef(false); // trava simples contra cliques múltiplos

  const errorTimeoutRef = useRef<number | null>(null);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);
  
  function resetErrorSoon() {
    // Evita que mensagens antigas "grudem" na UI
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    errorTimeoutRef.current = setTimeout(() => setError(null), 2500);
  }

  async function handleAdd() {
    const raw = newDomain.trim();
    const normalized = normalizeDomain(raw);

    // Validação básica
    if (!normalized) {
      setError("Informe um domínio válido, por ex.: exemplo.com");
      resetErrorSoon();
      return;
    }
    if (blacklist?.includes(normalized)) {
      setError(`"${normalized}" já está na lista.`);
      resetErrorSoon();
      setNewDomain("");
      return;
    }

    if (sendingRef.current) return;
    sendingRef.current = true;

    try {
      // Diagnostic log for smoke debugging: show what we're sending to store
      // eslint-disable-next-line no-console
      debug('[dbg] BlacklistManager.handleAdd -> normalized:', normalized);
      // Dispara ação do store (que deve conversar com o SW; o estado final volta por broadcast/state update)
      await addToBlacklist?.(normalized);
      setNewDomain(""); // limpa input apenas após tentativa
    } catch (e) {
      setError("Falha ao adicionar. Tente novamente.");
      resetErrorSoon();
      // não faz setState em loop; apenas exibe o erro e sai
    } finally {
      sendingRef.current = false;
    }
  }

  async function handleRemove(domain: string) {
    if (sendingRef.current) return;
    sendingRef.current = true;
    try {
      await removeFromBlacklist?.(domain);
    } catch (e) {
      setError("Falha ao remover. Tente novamente.");
      resetErrorSoon();
    } finally {
      sendingRef.current = false;
    }
  }

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <h2 className="text-xl font-semibold text-white">Sites bloqueados</h2>
        <p className="text-sm text-gray-400">
          Adicione ou remova domínios que serão bloqueados.
        </p>
      </div>

      {/* Lista */}
      <div className="glass-card p-4">
        <div className="space-y-2 mb-3">
          {(!blacklist || blacklist.length === 0) ? (
            <div className="text-center py-6 text-gray-500">
              Nenhum site bloqueado ainda.
            </div>
          ) : (
            blacklist.map((site) => {
              // blacklist items may be strings or objects (legacy). Normalize here to be defensive.
              const domain =
                typeof site === "string"
                  ? site
                  : site && typeof site === "object" && "domain" in site
                  ? String((site as any).domain)
                  : String(site);

              return (
                <div
                  key={domain}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <span className="text-white font-mono text-sm">{domain}</span>
                  <button
                    onClick={() => handleRemove(domain)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    aria-label={`Remover ${domain}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Adição */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="exemplo.com"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
            aria-label="Novo domínio"
          />
          <button
            onClick={handleAdd}
            disabled={sendingRef.current}
            className="px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            Adicionar
          </button>
        </div>

        {/* Erros */}
        {error && (
          <p
            id="blacklist-error"
            className="text-xs text-red-400 mt-2"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <p className="text-xs text-blue-300">
          💡 Sites bloqueados não carregam durante o uso normal e também em sessões de foco.
        </p>
      </div>
    </div>
  );
}
