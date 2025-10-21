export function normalizeDomain(d: string): string {
  try {
    const hostname = new URL(d.startsWith("http") ? d : `https://${d}`).hostname;
    return hostname.replace(/^www\./, '');
  } catch {
    return d.replace(/^www\./, '');
  }
}

export function extractDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^www\./, '');
  }
}
