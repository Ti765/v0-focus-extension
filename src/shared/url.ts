/**
 * Normaliza um domínio removendo "www." e ruídos comuns.
 * Aceita domínio puro (ex: "www.youtube.com") ou URL completa
 * (ex: "https://www.youtube.com/watch?v=...").
 */
export function normalizeDomain(domainOrUrl: string): string {
  if (!domainOrUrl) return "";
  const input = domainOrUrl.trim();

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
    const url = new URL(urlOrDomain.startsWith('http') ? urlOrDomain : `https://${urlOrDomain}`);
    const hostname = url.hostname.replace(/^www\./, "");
    
    // Extrai o domínio principal (últimos 2 ou 3 segmentos)
    const parts = hostname.split('.');
    
    // Casos especiais como .co.uk, .com.br, etc.
    const specialTlds = ['co.uk', 'co.jp', 'com.br', 'com.au', 'co.nz'];
    for (const tld of specialTlds) {
      if (hostname.endsWith(`.${tld}`)) {
        const segments = hostname.split('.');
        return segments.slice(-3).join('.');
      }
    }
    
    // Caso padrão: pega os últimos 2 segmentos (domínio principal)
    // Para subdomínios como "subdomain.demo.com", retorna "demo.com"
    return parts.slice(-2).join('.');
  } catch {
    // Se não for uma URL válida, tenta extrair o domínio principal
    const domain = urlOrDomain.replace(/^www\./, "").split('/')[0];
    const parts = domain.split('.');
    
    // Casos especiais
    const specialTlds = ['co.uk', 'co.jp', 'com.br', 'com.au', 'co.nz'];
    for (const tld of specialTlds) {
      if (domain.endsWith(`.${tld}`)) {
        const segments = domain.split('.');
        return segments.slice(-3).join('.');
      }
    }
    
    // Caso padrão: pega os últimos 2 segmentos (domínio principal)
    return parts.slice(-2).join('.');
  }
}
