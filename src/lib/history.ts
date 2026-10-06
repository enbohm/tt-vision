import type { AnalysisData } from "@/lib/analysis-utils";
import type { Language } from "@/lib/i18n";

export interface HistoryEntry {
  id: string;
  date: string;
  fileName: string;
  data: AnalysisData;
}

const KEY = "pinganalyst-history";
const LANG_KEY = "pinganalyst-language";

export function loadHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveToHistory(fileName: string, data: AnalysisData) {
  const entry: HistoryEntry = { id: crypto.randomUUID(), date: new Date().toISOString(), fileName, data };
  const all = [entry, ...loadHistory()].slice(0, 100);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function deleteFromHistory(id: string) {
  localStorage.setItem(KEY, JSON.stringify(loadHistory().filter((e) => e.id !== id)));
}

export function loadLanguage(): Language {
  return localStorage.getItem(LANG_KEY) === "sv" ? "sv" : "en";
}

export function storeLanguage(l: Language) {
  localStorage.setItem(LANG_KEY, l);
}
