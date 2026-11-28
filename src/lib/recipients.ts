// Destinatarios de una cápsula en el formulario. Sin dependencias de servidor.

export type Follower = { id: string; name: string; avatarUrl: string | null };

/** Una fila del formulario: escrita a mano o elegida entre los seguidores. */
export type RecipientRow =
  | { kind: "manual"; key: string; name: string; email: string }
  | {
      kind: "follower";
      key: string;
      name: string;
      avatarUrl: string | null;
      /** Vacío si ya no está entre los seguidores. */
      followerId: string | null;
      /** La fila ya guardada, al editar. Su correo no sale del servidor. */
      recipientId: string | null;
    };

export function emptyRow(key: string): RecipientRow {
  return { kind: "manual", key, name: "", email: "" };
}

/** Lo que se envía a la API. */
export function toPayload(row: RecipientRow) {
  if (row.kind === "manual") return { name: row.name, email: row.email };
  return row.recipientId
    ? { recipientId: row.recipientId }
    : { followerId: row.followerId };
}

const plain = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

/** Los seguidores que coinciden con lo escrito (sin importar tildes) y que no
 * están ya elegidos. */
export function matchingFollowers(
  followers: Follower[],
  typed: string,
  rows: RecipientRow[]
) {
  const chosen = new Set(
    rows.flatMap((r) => (r.kind === "follower" ? [r.followerId] : []))
  );
  const wanted = plain(typed);
  return followers.filter(
    (f) => !chosen.has(f.id) && plain(f.name).includes(wanted)
  );
}
