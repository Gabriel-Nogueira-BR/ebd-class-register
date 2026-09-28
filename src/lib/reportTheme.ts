// Frase/tema do rodapé dos relatórios, salva por ano.
const LEGACY_KEY = "ebd-report-theme";
const keyFor = (year: number) => `ebd-report-theme-${year}`;
const DEFAULTS: Record<number, string> = { 2025: "2025 ANO DA CELEBRAÇÃO - SALMOS 35.27" };

export function getReportTheme(year: number): string {
  const saved = localStorage.getItem(keyFor(year));
  if (saved !== null) return saved;
  const legacy = localStorage.getItem(LEGACY_KEY);
  if (legacy && legacy.trim().startsWith(String(year))) return legacy;
  return DEFAULTS[year] ?? `ESCOLA BÍBLICA DOMINICAL - ${year}`;
}

export function saveReportTheme(year: number, value: string) {
  localStorage.setItem(keyFor(year), value);
}
