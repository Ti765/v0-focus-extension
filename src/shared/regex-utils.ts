/**
 * Utility functions for regex operations, particularly for domain escaping in DNR rules
 */

/**
 * Creates a regex pattern for matching a domain and its subdomains in HTTP/HTTPS URLs.
 * Specifically formatted for Chrome's DeclarativeNetRequest (DNR) API.
 * 
 * CRITICAL FIX: The previous version failed to match domains without subdomains
 * (e.g., "youtube.com" vs "www.youtube.com")
 * 
 * @example
 * createDomainRegexPattern("youtube.com")
 * // Returns: "^https?://([^/]*\\.)?youtube\\.com(/.*)?$"
 * 
 * This correctly matches:
 * - https://youtube.com
 * - https://youtube.com/
 * - https://www.youtube.com
 * - https://m.youtube.com/watch?v=123
 * - https://music.youtube.com/channel/abc
 * 
 * @param domain - The domain to create a pattern for
 * @returns A regex pattern string that matches the domain and its subdomains
 */
export function createDomainRegexPattern(domain: string): string {
  // Escapa caracteres especiais de regex
  const escaped = domain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Padrão correto para Chrome DNR:
  // 1. ^https?:// - Protocolo obrigatório
  // 2. ([^/]*\\.)? - Captura qualquer subdomínio (opcional)
  // 3. ${escaped} - Domínio escapado
  // 4. (/.*)? - Caminho opcional (mas sem âncora final)
  return `^https?://([^/]*\\.)?${escaped}(/.*)?$`;
}
