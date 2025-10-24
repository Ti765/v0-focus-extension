/**
 * Utility functions for regex operations, particularly for domain escaping in DNR rules
 */


/**
 * Creates a urlFilter pattern for DNR (alternative to regexFilter)
 * @param domain - The domain to create a pattern for
 * @returns A urlFilter pattern string
 */
export function createDomainUrlFilter(domain: string): string {
  // The || prefix matches domain and all subdomains in DNR
  return `||${domain}`;
}