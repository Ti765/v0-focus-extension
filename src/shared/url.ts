/**
 * Normaliza um domínio removendo "www." e ruídos comuns.
 * Aceita domínio puro (ex: "www.youtube.com") ou URL completa
 * (ex: "https://www.youtube.com/watch?v=...").
 */
export function normalizeDomain(domainOrUrl: string): string {
  if (!domainOrUrl) return "";
  let input = domainOrUrl.trim();

  try {
    // Se não começar com http, tentamos como https p/ extrair hostname
    const url = new URL(input.startsWith("http") ? input : `https://${input}`);
    return url.hostname.replace(/^www\./, "");
  } catch {
    // Fallback para strings como "youtube.com/foo" ou "localhost:3000"
    // Pega o primeiro segmento até "/" e remove "www."
    const host = input.split("/")[0];
    return host.replace(/^www\./, "");
  }
}

/**
 * Extrai o domínio de uma URL (ou retorna o melhor possível se não for URL válida).
 * Ex.: "https://www.nytimes.com/..." -> "nytimes.com"
 */
export function extractDomain(urlOrDomain: string): string {
  if (!urlOrDomain) return "";
  try {
    const url = new URL(urlOrDomain);
    return url.hostname.replace(/^www\./, "");
  } catch {
    // Se não for uma URL válida, normaliza como domínio
    return normalizeDomain(urlOrDomain);
  }
}
