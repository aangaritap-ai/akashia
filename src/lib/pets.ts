// Reglas y textos de Huellitas. Sin dependencias de servidor: los usan las
// pantallas y la API.
import { dayAndMonth } from "@/lib/special-dates";

export const PET_SPECIES = [
  "DOG",
  "CAT",
  "BIRD",
  "RABBIT",
  "FISH",
  "HORSE",
  "OTHER",
] as const;
export type Species = (typeof PET_SPECIES)[number];

export const MAX_PETS = 20;
export const MAX_PET_NAME = 40;
export const MAX_PET_STORY = 1000;

/** Las fechas de mascota no llevan hora: se leen siempre en UTC. */
export const toDateInput = (date: Date | null) =>
  date ? date.toISOString().slice(0, 10) : "";

export const formatDay = (date: Date, locale: string) =>
  dayAndMonth(
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    locale,
    date.getUTCFullYear()
  );

// `t` son los textos de la sección "pets".
type PetText = (
  key: `species${Species}` | "born" | "familySince" | "passed",
  values?: { date: string }
) => string;

export function petSubtitle(
  pet: {
    species: Species;
    birthDate: Date | null;
    adoptionDate: Date | null;
    passedDate: Date | null;
  },
  t: PetText,
  locale: string
) {
  const parts = [t(`species${pet.species}`)];
  const day = (date: Date) => ({ date: formatDay(date, locale) });
  if (pet.birthDate) parts.push(t("born", day(pet.birthDate)));
  else if (pet.adoptionDate) {
    parts.push(t("familySince", day(pet.adoptionDate)));
  }
  if (pet.passedDate) parts.push(t("passed", day(pet.passedDate)));
  return parts.join(" · ");
}
