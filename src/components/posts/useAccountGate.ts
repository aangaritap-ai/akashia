"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { postAnchor } from "@/lib/posts";

/**
 * Lleva a entrar (sin sesión) o a completar los datos de la cuenta, según la
 * respuesta de la API. Devuelve true si se encargó.
 */
export function useAccountGate(messageId: string) {
  const router = useRouter();
  const pathname = usePathname();

  return function gate(status: number) {
    if (status === 401) {
      const back = `${pathname}#${postAnchor(messageId)}`;
      router.push(`/login?callbackUrl=${encodeURIComponent(back)}`);
      return true;
    }
    if (status === 403) {
      router.push("/completar-datos");
      return true;
    }
    return false;
  };
}
