// Filtro de edad. Sin dependencias de servidor. La fecha de nacimiento se
// comprueba y no se guarda.
import { isValidDay, todayIn, type Day } from "@/lib/special-dates";

export const MIN_AGE = 18;
export const MIN_BIRTH_YEAR = 1900;

/** Las cuentas creadas antes de esta fecha son anteriores al filtro. */
export const AGE_CHECK_SINCE = new Date("2026-11-28T02:47:00Z");

export function needsAgeCheck(user: {
  createdAt: Date;
  ageConfirmedAt: Date | null;
}) {
  return !user.ageConfirmedAt && user.createdAt >= AGE_CHECK_SINCE;
}

export type AgeResult = "adult" | "underage" | "invalid";

/** Recibe lo escrito en los campos birthDay, birthMonth y birthYear. */
export function checkBirthDate(
  input: { birthDay?: unknown; birthMonth?: unknown; birthYear?: unknown },
  today: Day = todayIn()
): AgeResult {
  const [day, month, year] = [
    input.birthDay,
    input.birthMonth,
    input.birthYear,
  ].map((value) => Number(value));
  if (
    ![day, month, year].every(Number.isInteger) ||
    year < MIN_BIRTH_YEAR ||
    !isValidDay(month, day, year)
  ) {
    return "invalid";
  }
  const hadBirthday =
    today.month > month || (today.month === month && today.day >= day);
  const age = today.year - year - (hadBirthday ? 0 : 1);
  if (age < 0) return "invalid";
  return age >= MIN_AGE ? "adult" : "underage";
}
