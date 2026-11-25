// Reglas y textos de Huellitas. Sin dependencias de servidor: los usan las
// pantallas y la API.
import { MONTH_NAMES } from "@/lib/special-dates";

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

export const SPECIES_LABELS: Record<Species, string> = {
  DOG: "Perro",
  CAT: "Gato",
  BIRD: "Ave",
  RABBIT: "Conejo",
  FISH: "Pez",
  HORSE: "Caballo",
  OTHER: "Otra especie",
};

export const MAX_PETS = 20;
export const MAX_PET_NAME = 40;
export const MAX_PET_STORY = 1000;

/** Las fechas de mascota no llevan hora: se leen siempre en UTC. */
export const toDateInput = (date: Date | null) =>
  date ? date.toISOString().slice(0, 10) : "";

export const formatDay = (date: Date) =>
  `${date.getUTCDate()} de ${MONTH_NAMES[date.getUTCMonth()]} de ${date.getUTCFullYear()}`;

export function petSubtitle(pet: {
  species: Species;
  birthDate: Date | null;
  adoptionDate: Date | null;
  passedDate: Date | null;
}) {
  const parts = [SPECIES_LABELS[pet.species]];
  if (pet.birthDate) parts.push(`Nació el ${formatDay(pet.birthDate)}`);
  else if (pet.adoptionDate) {
    parts.push(`En familia desde el ${formatDay(pet.adoptionDate)}`);
  }
  if (pet.passedDate) parts.push(`Partió el ${formatDay(pet.passedDate)}`);
  return parts.join(" · ");
}
