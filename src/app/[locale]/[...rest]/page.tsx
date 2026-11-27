import { notFound } from "next/navigation";

// Cualquier dirección desconocida muestra la página "no encontrada" en el idioma
// de quien visita.
export default function UnknownPage() {
  notFound();
}
