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

export const KIND_LABELS: Record<DateKind, string> = {
  BIRTHDAY: "Cumpleaños",
  ANNIVERSARY: "Aniversario",
  MEMORIAL: "Fecha de recuerdo",
  OTHER: "Otra fecha",
};

export const MONTH_NAMES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

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

/** "Cumpleaños de Mamá", "En memoria de Luis"… */
export function dateLabel(kind: DateKind, title: string) {
  if (kind === "BIRTHDAY") return `Cumpleaños de ${title}`;
  if (kind === "ANNIVERSARY") return `Aniversario: ${title}`;
  if (kind === "MEMORIAL") return `En memoria de ${title}`;
  return title;
}

/** "cumple 30 años" o "hace 5 años", si se guardó el año. */
export function yearsLabel(
  kind: DateKind,
  year: number | null,
  occurrenceYear: number
) {
  if (!year) return null;
  const years = occurrenceYear - year;
  if (years <= 0) return null;
  const unit = years === 1 ? "año" : "años";
  return kind === "BIRTHDAY" ? `cumple ${years} ${unit}` : `${years} ${unit}`;
}

export function whenLabel(daysUntil: number) {
  if (daysUntil === 0) return "Hoy";
  if (daysUntil === 1) return "Mañana";
  return `En ${daysUntil} días`;
}
