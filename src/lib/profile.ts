// Datos opcionales del perfil y quién puede verlos. Sin dependencias de
// servidor.
import { dayAndMonth } from "@/lib/special-dates";

export const MAX_BIO = 500;
export const MAX_MOTTO = 160;
export const MAX_CITY = 80;

/** Columnas que necesita la cabecera de una página de persona. */
export const profileSelect = {
  coverUrl: true,
  bio: true,
  motto: true,
  city: true,
  showCity: true,
  birthMonth: true,
  birthDay: true,
  shareBirthday: true,
} as const;

type ProfileRow = {
  coverUrl: string | null;
  bio: string | null;
  motto: string | null;
  city: string | null;
  showCity: boolean;
  birthMonth: number | null;
  birthDay: number | null;
  shareBirthday: boolean;
};

/**
 * Lo que se puede mostrar en la página. La ciudad solo si la persona lo
 * activó; el cumpleaños, además, solo a quien tenga permiso para verlo (la
 * propia persona y sus seguidores aprobados).
 */
export function profileDetails(
  row: ProfileRow,
  canSeeBirthday: boolean,
  locale: string
) {
  return {
    coverUrl: row.coverUrl,
    bio: row.bio,
    motto: row.motto,
    city: row.showCity ? row.city : null,
    birthday:
      canSeeBirthday && row.shareBirthday && row.birthMonth && row.birthDay
        ? dayAndMonth(row.birthMonth, row.birthDay, locale)
        : null,
  };
}
