const DEFAULT_STOP_WORDS = new Set([
  "a",
  "o",
  "e",
  "de",
  "da",
  "do",
  "das",
  "dos",
  "um",
  "uma",
  "no",
  "na",
  "em",
  "para",
  "por",
  "com",
  "que",
  "os",
  "as",
  "se",
  "ao",
  "como",
  "mais",
  "mas",
  "sobre",
  "the",
  "and",
  "for",
  "you",
  "your",
  "from",
  "this",
  "that",
  "are",
  "was",
]);

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  programacao: [
    "javascript",
    "typescript",
    "python",
    "react",
    "firebase",
    "node",
    "backend",
    "frontend",
    "api",
    "coding",
    "development",
    "software",
    "web",
    "debug",
    "algoritmo",
    "deploy",
  ],
  design: ["ui", "ux", "figma", "design", "prototype", "interface"],
  produtividade: ["pomodoro", "foco", "productivity", "habits", "planner", "task"],
  tecnologia: ["cloud", "ai", "ml", "hardware", "android", "ios", "devops"],
  noticias: ["news", "breaking", "politica", "eleicao", "journal", "headline"],
  culinaria: ["receita", "cozinha", "ingredientes", "culinaria", "chefe", "restaurante"],
};

export interface TextInsights {
  keywords: string[];
  keywordFrequencies: Record<string, number>;
  categories: string[];
}

export function tokenize(text: string): string[] {
  if (!text) return [];
  return (text.toLowerCase().match(/\b[\p{L}\p{N}]{3,}\b/gu) || []).filter(
    (token) => !DEFAULT_STOP_WORDS.has(token)
  );
}

export function buildFrequencyMap(tokens: string[]): Record<string, number> {
  return tokens.reduce<Record<string, number>>((acc, token) => {
    acc[token] = (acc[token] || 0) + 1;
    return acc;
  }, {});
}

export function extractTopKeywords(text: string, limit = 10): TextInsights {
  const tokens = tokenize(text);
  const frequencyMap = buildFrequencyMap(tokens);

  const keywords = Object.entries(frequencyMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([word]) => word);

  const categories = categorizeKeywords(keywords);

  return {
    keywords,
    keywordFrequencies: frequencyMap,
    categories,
  };
}

export function categorizeKeywords(keywords: string[]): string[] {
  const detected = new Set<string>();
  for (const keyword of keywords) {
    for (const [category, values] of Object.entries(CATEGORY_KEYWORDS)) {
      if (values.includes(keyword)) {
        detected.add(category);
      }
    }
  }
  return [...detected];
}

export function mergeKeywords(
  base: Record<string, number>,
  incoming: Record<string, number>
): Record<string, number> {
  const next = { ...base };
  for (const [key, value] of Object.entries(incoming)) {
    if (!value) continue;
    next[key] = (next[key] || 0) + value;
  }
  return next;
}
