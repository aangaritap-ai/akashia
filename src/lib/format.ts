// Textos de tiempo en el idioma de quien mira. Sin dependencias de servidor.

type TimeText = (
  key: "now" | "minutes" | "hours" | "days" | "weeks",
  values?: { count: number }
) => string;

// Corto, para avisos y solicitudes: "ahora", "19 min", "2 h", "3 días".
// `t` son los textos de la sección "time".
export function shortAgo(
  date: Date | string,
  t: TimeText,
  locale: string,
  now = Date.now()
): string {
  const d = new Date(date);
  const minutes = Math.floor((now - d.getTime()) / 60_000);
  if (minutes < 1) return t("now");
  if (minutes < 60) return t("minutes", { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("hours", { count: hours });
  const days = Math.floor(hours / 24);
  if (days < 7) return t("days", { count: days });
  if (days < 30) return t("weeks", { count: Math.floor(days / 7) });
  return d.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    timeZone: "America/Bogota",
  });
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["day", 86_400_000],
  ["hour", 3_600_000],
  ["minute", 60_000],
];

// "hace 3 días" para lo reciente; fecha completa pasado un mes.
export function timeAgo(
  date: Date | string,
  locale: string,
  justNow: string
): string {
  const d = new Date(date);
  const diff = d.getTime() - Date.now();

  if (Math.abs(diff) > 30 * 86_400_000) {
    return d.toLocaleDateString(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  for (const [unit, ms] of UNITS) {
    if (Math.abs(diff) >= ms) {
      return rtf.format(Math.round(diff / ms), unit);
    }
  }
  return justNow;
}
