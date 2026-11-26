// Personas que no se vuelven a sugerir en este navegador: las que quité de las
// sugerencias, y las solicitudes o seguidores que eliminé.
const KEY = "akashia:sugerencias-ocultas";
const MAX = 200;

/** Lista guardada, separada por comas. Vacía si no hay almacenamiento. */
export function hiddenSuggestions(): string {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export function hideSuggestion(id: string) {
  const ids = hiddenSuggestions()
    .split(",")
    .filter((saved) => saved && saved !== id);
  try {
    localStorage.setItem(KEY, [...ids, id].slice(-MAX).join(","));
  } catch {
    // Sin almacenamiento (modo privado): no se recuerda.
  }
}
