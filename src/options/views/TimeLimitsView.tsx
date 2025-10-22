"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Clock } from "lucide-react";
import type { TimeLimitEntry } from "../../shared/types";
import { normalizeDomain } from "../../shared/url";
import { useStore } from "../../popup/store"; // mantém a mesma store do popup

// Usa o store compartilhado do popup para todas as mensagens/ações

export default function TimeLimitsView() {
  // consome estado e utilitários do store (para refletir updates do SW)
  const { timeLimits, loadState, listenForUpdates, setTimeLimit, error, setError } = useStore((s) => ({
    timeLimits: s.timeLimits,
    loadState: s.loadState,
    listenForUpdates: s.listenForUpdates,
    setTimeLimit: s.setTimeLimit,
    error: s.error,
    setError: s.setError,
  }));

  const [newDomain, setNewDomain] = useState("");
  const [newLimit, setNewLimit] = useState<number>(60);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // carrega o estado atual e começa a ouvir STATE_UPDATED
    loadState();
    const unsubscribe = listenForUpdates();
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // evita renderizações desnecessárias
  const limitsSorted = useMemo<TimeLimitEntry[]>(
    () => [...timeLimits].sort((a, b) => a.domain.localeCompare(b.domain)),
    [timeLimits]
  );

  async function setTimeLimitAction(domainRaw: string, limitMinutes: number) {
    setError(null);
    setSuccessMessage(null);

    const domain = normalizeDomain(domainRaw.trim());
    if (!domain) {
      setError("Informe um domínio válido (ex.: exemplo.com).");
      return;
    }
    if (limitMinutes < 0 || Number.isNaN(limitMinutes)) {
      setError("Informe um limite válido em minutos (número inteiro ≥ 0).");
      return;
    }

    try {
      await setTimeLimit(domain, limitMinutes);
      setSuccessMessage(
        limitMinutes > 0
          ? `Limite para ${domain} definido/atualizado para ${limitMinutes} min.`
          : `Limite removido para ${domain}.`
      );
      // limpa mensagem depois de alguns segundos
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e: any) {
      console.error("[v0] Error setting time limit:", e);
      // O store já define setError; apenas garanta mensagem local se necessário
      if (!error) setError(e?.message || "Falha ao definir o limite de tempo.");
    }
  }

  async function addTimeLimit() {
    try {
      await setTimeLimitAction(newDomain, newLimit);
      // clear inputs on success
      setNewDomain("");
      setNewLimit(60);
    } catch (e) {
      // store will set error — nothing else to do here
    }
  }

  async function removeTimeLimit(domain: string) {
    try {
      await setTimeLimitAction(domain, 0);
    } catch (e) {
      // store sets error
    }
  }

  function onDomainKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTimeLimit();
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <h2 className="text-3xl font-bold text-white mb-2">Limites de Tempo</h2>
        <p className="text-gray-400">Defina limites diários para sites específicos.</p>
      </div>

      {/* Mensagens de erro/sucesso */}
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/30 text-red-300 text-sm rounded-md">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="p-3 bg-green-500/20 border border-green-500/30 text-green-300 text-sm rounded-md">
          {successMessage}
        </div>
      )}

      {/* Formulário de adição/atualização */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Adicionar/Atualizar Limite</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="exemplo.com"
            value={newDomain}
            onChange={(e) => {
              setNewDomain(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={onDomainKeyDown}
            className={`flex-1 px-4 py-2 bg-white/5 border ${
              error ? "border-red-500/50" : "border-white/10"
            } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50`}
            aria-label="Domínio para limitar"
          />
          <input
            type="number"
            min={1}
            value={newLimit}
            onChange={(e) => {
              const v = Number(e.target.value);
              setNewLimit(Number.isNaN(v) ? 1 : Math.max(1, Math.trunc(v)));
              if (error) setError(null);
            }}
            className="w-full sm:w-32 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
            aria-label="Limite em minutos"
          />
          <button
            onClick={addTimeLimit}
            className="w-full sm:w-auto px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Salvar
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Insira o domínio e o limite em minutos por dia. Se o domínio já existir, o limite será atualizado.
        </p>
      </div>

      {/* Lista de limites */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Limites Ativos</h3>
        {limitsSorted.length > 0 ? (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {limitsSorted.map((limit) => (
              <div
                key={limit.domain}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div>
                  <div className="text-white font-medium">{limit.domain}</div>
                  <div className="text-sm text-gray-400">{limit.limitMinutes} minutos por dia</div>
                </div>
                <button
                  onClick={() => removeTimeLimit(limit.domain)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  aria-label={`Remover limite de ${limit.domain}`}
                  title="Remover Limite"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum limite configurado.</p>
            <p className="text-xs mt-1">Use o formulário acima para adicionar limites.</p>
          </div>
        )}
      </div>
    </div>
  );
}
