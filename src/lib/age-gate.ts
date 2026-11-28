import { cookies } from "next/headers";
import { checkBirthDate, type AgeResult } from "@/lib/age";

// Quien declara ser menor no puede volver a intentarlo cambiando la fecha
// durante un día, en el mismo navegador.
const COOKIE = "akashia-edad";
const ONE_DAY = 86_400;

/**
 * Comprueba la fecha escrita. Solo se usa en acciones y rutas del servidor,
 * donde se pueden guardar cookies.
 */
export async function ageGate(
  input: Parameters<typeof checkBirthDate>[0]
): Promise<AgeResult> {
  const store = await cookies();
  if (store.has(COOKIE)) return "underage";
  const result = checkBirthDate(input);
  if (result === "underage") {
    store.set(COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: ONE_DAY,
      path: "/",
    });
  }
  return result;
}
