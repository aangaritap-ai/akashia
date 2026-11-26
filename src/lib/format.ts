const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["day", 86_400_000],
  ["hour", 3_600_000],
  ["minute", 60_000],
];

// Corto, para avisos y solicitudes: "ahora", "19 min", "2 h", "3 días".
export function shortAgo(date: Date | string, now = Date.now()): string {
  const d = new Date(date);
  const minutes = Math.floor((now - d.getTime()) / 60_000);
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1 día";
  if (days < 7) return `${days} días`;
  if (days < 30) return `${Math.floor(days / 7)} sem`;
  return d.toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    timeZone: "America/Bogota",
  });
}

// "hace 3 días" para lo reciente; fecha completa pasado un mes.
export function timeAgo(date: Date | string): string {
  const d = new Date(date);
  const diff = d.getTime() - Date.now();

  if (Math.abs(diff) > 30 * 86_400_000) {
    return d.toLocaleDateString("es", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  for (const [unit, ms] of UNITS) {
    if (Math.abs(diff) >= ms) {
      return rtf.format(Math.round(diff / ms), unit);
    }
  }
  return "ahora mismo";
}
