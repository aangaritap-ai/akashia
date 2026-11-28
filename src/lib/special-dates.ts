// Cálculos de las fechas especiales. Sin dependencias de servidor: los usan la
// pantalla, la API y la tarea diaria.

// El servidor corre en UTC; "hoy" se calcula con la hora de Colombia.
export const APP_TIMEZONE = "America/Bogota";
export const MAX_DATES = 100;
export const MAX_DATE_TITLE = 80;
export const MIN_YEAR = 1900;

export const DATE_KINDS = [
  "BIRTHDAY",
  "ANNIVERSARY",
  "MEMORIAL",
  "OTHER",
] as const;
export type DateKind = (typeof DATE_KINDS)[number];

/** "marzo" / "March" (mes de 1 a 12). */
export function monthName(month: number, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2000, month - 1, 1)));
}

/** "14 de marzo" / "March 14"; con año, la fecha completa. */
export function dayAndMonth(
  month: number,
  day: number,
  locale: string,
  year?: number
) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    ...(year ? { year: "numeric" } : {}),
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year ?? 2000, month - 1, day)));
}

export type Day = { year: number; month: number; day: number };

export function todayIn(now: Date = new Date()): Day {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(now);
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)!.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

/**
 * Las cápsulas con fecha se envían desde que empieza el día elegido (hora de
 * Colombia): están listas las anteriores a este momento.
 */
export function startOfTomorrow(now: Date = new Date()) {
  const { year, month, day } = todayIn(now);
  return new Date(Date.UTC(year, month - 1, day + 1));
}

/** El primer día que se puede elegir para una cápsula: mañana ("2026-03-14"). */
export function firstDeliveryDate(now: Date = new Date()) {
  return startOfTomorrow(now).toISOString().slice(0, 10);
}

export function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** Sin año se acepta el 29 de febrero. */
export function isValidDay(month: number, day: number, year?: number | null) {
  const max = new Date(Date.UTC(year ?? 2000, month, 0)).getUTCDate();
  return month >= 1 && month <= 12 && day >= 1 && day <= max;
}

// El día en que se celebra en un año dado: el 29 de febrero pasa al 28 en los
// años que no son bisiestos.
function occurrenceIn(year: number, month: number, day: number): Day {
  if (month === 2 && day === 29 && !isLeapYear(year)) {
    return { year, month, day: 28 };
  }
  return { year, month, day };
}

const utc = (d: Day) => Date.UTC(d.year, d.month - 1, d.day);

/** La próxima vez que toca la fecha, contando hoy. */
export function nextOccurrence(month: number, day: number, today: Day): Day {
  const thisYear = occurrenceIn(today.year, month, day);
  return utc(thisYear) >= utc(today)
    ? thisYear
    : occurrenceIn(today.year + 1, month, day);
}

export function daysBetween(from: Day, to: Day) {
  return Math.round((utc(to) - utc(from)) / 86_400_000);
}

// Los textos que siguen reciben `t`, la sección "dates" del idioma.
type DateText = (
  key:
    | "birthdayOf"
    | "anniversaryOf"
    | "memorialOf"
    | "turns"
    | "yearsAgo"
    | "today"
    | "tomorrow"
    | "inDays",
  values?: Record<string, string | number>
) => string;

/** "Cumpleaños de Mamá", "En memoria de Luis"… */
export function dateLabel(kind: DateKind, title: string, t: DateText) {
  if (kind === "BIRTHDAY") return t("birthdayOf", { title });
  if (kind === "ANNIVERSARY") return t("anniversaryOf", { title });
  if (kind === "MEMORIAL") return t("memorialOf", { title });
  return title;
}

/** Años que se cumplen en esa ocurrencia, si se guardó el año. */
export function yearsSince(year: number | null, occurrenceYear: number) {
  if (!year) return null;
  const years = occurrenceYear - year;
  return years > 0 ? years : null;
}

/** "cumple 30 años" o "5 años". */
export function yearsLabel(kind: DateKind, years: number | null, t: DateText) {
  if (!years) return null;
  return t(kind === "BIRTHDAY" ? "turns" : "yearsAgo", { count: years });
}

export function whenLabel(daysUntil: number, t: DateText) {
  if (daysUntil === 0) return t("today");
  if (daysUntil === 1) return t("tomorrow");
  return t("inDays", { count: daysUntil });
}
