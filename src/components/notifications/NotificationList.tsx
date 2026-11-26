"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Avatar from "@/components/Avatar";
import MutualsLine from "@/components/connections/MutualsLine";
import RequestButtons from "@/components/connections/RequestButtons";
import {
  IconCalendar,
  IconCheck,
  IconDots,
  IconHeart,
  IconShield,
  IconUsers,
} from "@/components/icons";
import type { NotificationView } from "@/lib/notifications";

// Distintivo que va sobre la foto, según el tipo de aviso.
const KINDS = {
  CONNECTION_REQUEST: { icon: IconUsers, tone: "bg-sky-600" },
  CONNECTION_ACCEPTED: { icon: IconCheck, tone: "bg-emerald-600" },
  EVENT_REMINDER: { icon: IconCalendar, tone: "bg-pink-600" },
  STORY_LIKE: { icon: IconHeart, tone: "bg-red-600" },
  GUARDIAN_INVITE: { icon: IconShield, tone: "bg-accent" },
} as const;

const menuItemClass =
  "w-full rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-black/[0.05]";

// El texto del aviso, con el nombre de la persona en negrilla. Los avisos sin
// persona muestran su título.
function Text({ n }: { n: NotificationView }) {
  if (!n.actor) {
    return (
      <>
        <strong className="block font-semibold">{n.title}</strong>
        {n.body}
      </>
    );
  }
  const { name } = n.actor;
  const at = n.body.indexOf(name);
  if (at < 0) return <>{n.body}</>;
  return (
    <>
      {n.body.slice(0, at)}
      <strong className="font-semibold">{name}</strong>
      {n.body.slice(at + name.length)}
    </>
  );
}

function Item({
  n,
  onOpen,
  onRead,
  onRemove,
}: {
  n: NotificationView;
  onOpen: () => void;
  onRead: () => void;
  onRemove: () => void;
}) {
  const { icon: Icon, tone } = KINDS[n.type];
  // El enlace cubre toda la fila; los botones quedan por encima.
  const cover =
    "block w-full text-left text-sm leading-snug text-foreground [overflow-wrap:anywhere] after:absolute after:inset-0 after:rounded-xl";

  return (
    <li className="relative flex gap-3 rounded-xl p-2 hover:bg-black/[0.04]">
      <span className="relative shrink-0 self-start">
        {n.actor ? (
          <>
            <Avatar name={n.actor.name} src={n.actor.avatarUrl} size="lg" />
            <span
              aria-hidden="true"
              className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-white ring-2 ring-surface ${tone}`}
            >
              <Icon className="w-3.5 h-3.5" />
            </span>
          </>
        ) : (
          <span
            aria-hidden="true"
            className={`flex h-14 w-14 items-center justify-center rounded-full text-white ${tone}`}
          >
            <Icon className="w-6 h-6" />
          </span>
        )}
      </span>

      <div className="min-w-0 flex-1">
        {n.linkUrl ? (
          <Link href={n.linkUrl} onClick={onOpen} className={cover}>
            <Text n={n} />
          </Link>
        ) : (
          <button type="button" onClick={onRead} className={cover}>
            <Text n={n} />
          </button>
        )}
        <div
          className={`mt-0.5 text-xs ${n.read ? "text-muted" : "font-semibold text-sky-700"}`}
        >
          {n.ago}
        </div>
        {n.request && (
          <div className="mt-2 flex flex-col gap-2">
            <MutualsLine mutuals={n.request.mutuals} />
            <RequestButtons
              connectionId={n.request.connectionId}
              personId={n.actor!.id}
              onDone={onRead}
            />
          </div>
        )}
        {n.accepted && <p className="mt-1 text-xs text-muted">Ya te sigue.</p>}
      </div>

      <div className="flex w-6 shrink-0 flex-col items-center justify-between gap-2">
        <button
          type="button"
          onClick={onRemove}
          aria-label="Borrar notificación"
          className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full text-xs text-muted hover:bg-black/[0.06] hover:text-red-600"
        >
          ✕
        </button>
        {!n.read && (
          <span
            role="img"
            aria-label="Sin leer"
            className="mb-3 h-3 w-3 rounded-full bg-sky-600"
          />
        )}
      </div>
    </li>
  );
}

// La lista de avisos: la misma en el panel de la campana y en su página. En la
// página llegan ya cargados (`initial`); el panel los pide al abrirse.
export default function NotificationList({
  initial,
  panel = false,
  onNavigate,
}: {
  initial?: NotificationView[];
  panel?: boolean;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [fetched, setFetched] = useState<NotificationView[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [menu, setMenu] = useState<"closed" | "open" | "confirm">("closed");
  // Cambios hechos aquí, encima de lo que llegó del servidor.
  const [read, setRead] = useState<string[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);

  useEffect(() => {
    if (initial) return;
    let alive = true;
    fetch("/api/notifications")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => alive && setFetched(data.items))
      .catch(
        () => alive && setError("No se pudieron cargar. Inténtalo de nuevo.")
      );
    return () => {
      alive = false;
    };
  }, [initial]);

  // Guarda el cambio y refresca el contador de la campana.
  async function save(url: string, method: "PATCH" | "DELETE") {
    setError(null);
    try {
      const res = await fetch(url, { method, keepalive: true });
      if (!res.ok) throw new Error();
      router.refresh();
      return true;
    } catch {
      setError("No se pudo guardar el cambio. Inténtalo de nuevo.");
      return false;
    }
  }

  const loaded = initial ?? fetched;
  const items = (loaded ?? [])
    .filter((n) => !removed.includes(n.id))
    .map((n) => ({ ...n, read: n.read || read.includes(n.id) }));

  function markRead(n: NotificationView) {
    if (n.read) return;
    setRead((prev) => [...prev, n.id]);
    void save(`/api/notifications/${n.id}`, "PATCH");
  }

  async function remove(id: string) {
    if (await save(`/api/notifications/${id}`, "DELETE")) {
      setRemoved((prev) => [...prev, id]);
    }
  }

  async function markAll() {
    setMenu("closed");
    const ids = items.map((n) => n.id);
    if (await save("/api/notifications", "PATCH")) {
      setRead((prev) => [...prev, ...ids]);
    }
  }

  async function clearAll() {
    setMenu("closed");
    const ids = items.map((n) => n.id);
    if (await save("/api/notifications", "DELETE")) {
      setRemoved((prev) => [...prev, ...ids]);
    }
  }

  const shown = onlyUnread ? items.filter((n) => !n.read) : items;
  const groups = [
    { title: "Nuevas", list: shown.filter((n) => n.recent) },
    { title: "Anteriores", list: shown.filter((n) => !n.recent) },
  ].filter((g) => g.list.length > 0);
  const Heading = panel ? "h2" : "h1";

  const seeAll = panel && (
    <Link
      href="/dashboard/notifications"
      onClick={onNavigate}
      className="text-sm font-semibold text-accent hover:underline"
    >
      Ver todo
    </Link>
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="relative flex items-center justify-between gap-3 px-2">
        <Heading className="font-display text-2xl font-semibold text-foreground">
          Notificaciones
        </Heading>
        {items.length > 0 && (
          <button
            type="button"
            onClick={() => setMenu(menu === "closed" ? "open" : "closed")}
            aria-label="Opciones"
            aria-expanded={menu !== "closed"}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-black/[0.05]"
          >
            <IconDots />
          </button>
        )}
        {menu !== "closed" && (
          <div className="absolute right-2 top-10 z-20 w-60 rounded-xl border border-border bg-surface p-1.5 shadow-lg">
            {menu === "open" ? (
              <>
                <button type="button" onClick={markAll} className={menuItemClass}>
                  Marcar todas como leídas
                </button>
                <button
                  type="button"
                  onClick={() => setMenu("confirm")}
                  className={menuItemClass}
                >
                  Borrar todas
                </button>
              </>
            ) : (
              <>
                <p className="px-3 py-1.5 text-sm text-muted">
                  ¿Borrar todas las notificaciones?
                </p>
                <button
                  type="button"
                  onClick={clearAll}
                  className={`${menuItemClass} font-semibold !text-red-600`}
                >
                  Sí, borrar todas
                </button>
                <button
                  type="button"
                  onClick={() => setMenu("closed")}
                  className={menuItemClass}
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2 px-2">
        {[
          { label: "Todas", unread: false },
          { label: "No leídas", unread: true },
        ].map((tab) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => setOnlyUnread(tab.unread)}
            aria-pressed={onlyUnread === tab.unread}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              onlyUnread === tab.unread
                ? "bg-accent/10 text-accent"
                : "text-foreground hover:bg-black/[0.05]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <p className="px-2 text-sm text-red-600">{error}</p>}

      {!loaded ? (
        !error && <p className="px-2 py-6 text-sm text-muted">Cargando...</p>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-sm text-muted">
          {onlyUnread
            ? "No tienes avisos sin leer."
            : "Todavía no tienes notificaciones."}
          {seeAll}
        </div>
      ) : (
        groups.map((group, i) => (
          <section key={group.title}>
            <div className="flex items-baseline justify-between gap-3 px-2">
              <h3 className="font-display font-medium text-lg text-foreground">
                {group.title}
              </h3>
              {i === 0 && seeAll}
            </div>
            <ul className="mt-1 flex flex-col">
              {group.list.map((n) => (
                <Item
                  key={n.id}
                  n={n}
                  onOpen={() => {
                    markRead(n);
                    onNavigate?.();
                  }}
                  onRead={() => markRead(n)}
                  onRemove={() => remove(n.id)}
                />
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
