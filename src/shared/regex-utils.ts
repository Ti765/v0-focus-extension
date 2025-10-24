/**
 * Utility functions for regex operations, particularly for domain escaping in DNR rules
 */

/**
 * Creates a regex pattern for matching a domain and its subdomains in HTTP/HTTPS URLs.
 * Specifically formatted for Chrome's DeclarativeNetRequest (DNR) API.
 * 
 * Important: DNR processes regexFilter as a JavaScript string, not a regex literal.
 * Therefore:
 * 1. Forward slashes (/) should NOT be escaped
 * 2. Only dots (.) need to be escaped as they're regex metacharacters
 * 
 * @example
 * createDomainRegexPattern("example.com")
 * // Returns: "^https?://([^/]+\\.)?example\\.com(/|$)"
 * 
 * @param domain - The domain to create a pattern for
 * @returns A regex pattern string that matches the domain and its subdomains
 */
export function createDomainRegexPattern(domain: string): string {
  // Escapa apenas pontos (caractere especial de regex)
  // Barras / não precisam de escape em strings JavaScript para DNR
  const escaped = domain.replace(/\./g, "\\.");
  
  // Padrão: captura domínio exato E subdomínios
  // Exemplos que devem casar:
  //   - youtube.com
  //   - www.youtube.com
  //   - m.youtube.com
  //   - qualquercoisa.youtube.com
  return `^https?://([^/]+\\.)?${escaped}(/|$)`;
}
