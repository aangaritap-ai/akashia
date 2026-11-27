import { z } from "zod";
import type { Pet, Prisma } from "@prisma/client";
import { MAX_PET_NAME, MAX_PET_STORY, PET_SPECIES } from "@/lib/pets";
import { todayIn } from "@/lib/special-dates";
import { isStorageUrl } from "@/lib/uploads";

const day = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .nullable()
  .optional();

const schema = z.object({
  name: z.string().trim().min(1).max(MAX_PET_NAME),
  species: z.enum(PET_SPECIES),
  story: z.string().trim().max(MAX_PET_STORY).nullable().optional(),
  photoUrl: z.string().url().refine(isStorageUrl).nullable().optional(),
  birthDate: day,
  adoptionDate: day,
  passedDate: day,
});

type PetData = Pick<
  Pet,
  | "name"
  | "species"
  | "story"
  | "photoUrl"
  | "birthDate"
  | "adoptionDate"
  | "passedDate"
>;

/** Valida lo que llega del formulario. Devuelve los datos o el error. */
type PetError =
  | "petInvalid"
  | "petBadDate"
  | "petDateRange"
  | "petPassedBefore";

export function parsePet(
  body: unknown
): { data: PetData } | { error: PetError } {
  const parsed = schema.safeParse(body);
  if (!parsed.success) return { error: "petInvalid" };

  const t = todayIn();
  const today = Date.UTC(t.year, t.month - 1, t.day);
  const dates: Record<string, Date | null> = {};
  for (const key of ["birthDate", "adoptionDate", "passedDate"] as const) {
    const value = parsed.data[key];
    if (!value) {
      dates[key] = null;
      continue;
    }
    const date = new Date(`${value}T00:00:00Z`);
    // Rechaza fechas que no existen, como el 31 de abril.
    if (Number.isNaN(date.getTime()) || !date.toISOString().startsWith(value)) {
      return { error: "petBadDate" };
    }
    if (date.getTime() > today || date.getUTCFullYear() < 1900) {
      return { error: "petDateRange" };
    }
    dates[key] = date;
  }

  const { birthDate, adoptionDate, passedDate } = dates;
  if (
    passedDate &&
    ((birthDate && passedDate < birthDate) ||
      (adoptionDate && passedDate < adoptionDate))
  ) {
    return { error: "petPassedBefore" };
  }

  return {
    data: {
      name: parsed.data.name,
      species: parsed.data.species,
      story: parsed.data.story || null,
      photoUrl: parsed.data.photoUrl ?? null,
      birthDate,
      adoptionDate,
      passedDate,
    },
  };
}

/** Deja en "Fechas especiales" las de la mascota: crea, actualiza o quita. */
export async function syncPetDates(tx: Prisma.TransactionClient, pet: Pet) {
  const wanted = [
    { kind: "BIRTHDAY", title: pet.name, date: pet.birthDate },
    {
      kind: "ANNIVERSARY",
      title: `Adopción de ${pet.name}`,
      date: pet.adoptionDate,
    },
    { kind: "MEMORIAL", title: pet.name, date: pet.passedDate },
  ] as const;
  const current = await tx.specialDate.findMany({ where: { petId: pet.id } });

  for (const { kind, title, date } of wanted) {
    const existing = current.find((d) => d.kind === kind);
    if (!date) {
      if (existing) await tx.specialDate.delete({ where: { id: existing.id } });
      continue;
    }
    const data = {
      title,
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate(),
      year: date.getUTCFullYear(),
    };
    if (!existing) {
      await tx.specialDate.create({
        data: { ...data, kind, ownerId: pet.ownerId, petId: pet.id },
      });
      continue;
    }
    const moved =
      existing.month !== data.month || existing.day !== data.day;
    await tx.specialDate.update({
      where: { id: existing.id },
      data: moved ? { ...data, lastRemindedYear: null } : data,
    });
  }
}
