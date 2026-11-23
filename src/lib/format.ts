const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["day", 86_400_000],
  ["hour", 3_600_000],
  ["minute", 60_000],
];

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
