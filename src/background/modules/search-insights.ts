import { extractTopKeywords } from "../../lib/insights/textProcessing";
import { recordSearchInsights, getCurrentSummaryDate } from "./daily-summary";

interface SearchEngine {
  hostIncludes: string;
  param: string;
  pathIncludes?: string;
}

const SEARCH_ENGINES: SearchEngine[] = [
  { hostIncludes: "google.", param: "q", pathIncludes: "/search" },
  { hostIncludes: "bing.com", param: "q", pathIncludes: "/search" },
  { hostIncludes: "duckduckgo.com", param: "q" },
  { hostIncludes: "startpage.com", param: "query" },
];

const MAX_QUERIES_PER_DAY = 500;
const recordedQueries = new Set<string>();
let lastRecordedDate: string | null = null;

function parseSearchQuery(urlString: string): string | null {
  try {
    const url = new URL(urlString);
    const engine = SEARCH_ENGINES.find((candidate) => {
      return (
        url.hostname.includes(candidate.hostIncludes) &&
        (!candidate.pathIncludes || url.pathname.includes(candidate.pathIncludes))
      );
    });

    if (!engine) return null;
    const query = url.searchParams.get(engine.param);
    if (!query) return null;
    return query.trim();
  } catch {
    return null;
  }
}

function shouldRecord(query: string): boolean {
  if (!query) return false;
  const currentDate = getCurrentSummaryDate();
  if (lastRecordedDate !== currentDate) {
    recordedQueries.clear();
    lastRecordedDate = currentDate;
  }
  const key = `${currentDate}:${query.toLowerCase()}`;
  if (recordedQueries.has(key)) {
    return false;
  }
  if (recordedQueries.size >= MAX_QUERIES_PER_DAY) {
    const oldest = recordedQueries.values().next().value;
    if (oldest) {
      recordedQueries.delete(oldest);
    }
  }
  recordedQueries.add(key);
  return true;
}

export async function maybeRecordSearchFromUrl(url: string) {
  const query = parseSearchQuery(url);
  if (!query || !shouldRecord(query)) {
    return;
  }

  const insight = extractTopKeywords(query, 5);
  const keywords = [query.toLowerCase(), ...insight.keywords];
  await recordSearchInsights(keywords, insight.categories);
}
