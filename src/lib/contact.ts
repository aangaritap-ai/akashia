import { z } from "zod";
import { MAX_CITY } from "@/lib/profile";

// Los datos obligatorios de una cuenta. `name` guarda nombre y apellido juntos
// (es lo que se muestra) y `lastName`, el apellido.
export const MAX_FIRST_NAME = 50;
export const MAX_LAST_NAME = 50;
export const MAX_PHONE = 25;
/** Para el atributo `pattern` del campo en el navegador. */
export const PHONE_PATTERN = "\\+?[0-9 \\(\\)\\-]{7,25}";

/** Admite espacios, guiones, paréntesis y un + inicial; de 7 a 15 cifras. */
export function isPhone(value: string) {
  const digits = value.replace(/\D/g, "").length;
  return /^\+?[0-9 ()-]+$/.test(value) && digits >= 7 && digits <= 15;
}

export const contactShape = {
  firstName: z.string().trim().min(1).max(MAX_FIRST_NAME),
  lastName: z.string().trim().min(1).max(MAX_LAST_NAME),
  phone: z.string().trim().max(MAX_PHONE).refine(isPhone),
  city: z.string().trim().min(1).max(MAX_CITY),
};

export const contactSchema = z.object(contactShape);

export type Contact = z.infer<typeof contactSchema>;

/** Las columnas que se guardan a partir de lo escrito. */
export function contactData({ firstName, lastName, phone, city }: Contact) {
  return { name: `${firstName} ${lastName}`, lastName, phone, city };
}

/** Separa el nombre guardado para rellenar los dos campos. En cuentas sin
 * apellido registrado propone la primera palabra como nombre. */
export function splitName(name: string, lastName: string | null) {
  if (lastName && name.endsWith(` ${lastName}`)) {
    return { firstName: name.slice(0, -lastName.length - 1), lastName };
  }
  const [first = "", ...rest] = name.trim().split(/\s+/);
  return { firstName: first, lastName: lastName ?? rest.join(" ") };
}

export const contactSelect = {
  name: true,
  lastName: true,
  phone: true,
  city: true,
} as const;

export function isContactComplete(user: {
  name: string;
  lastName: string | null;
  phone: string | null;
  city: string | null;
}) {
  return [user.name, user.lastName, user.phone, user.city].every((value) =>
    value?.trim()
  );
}
