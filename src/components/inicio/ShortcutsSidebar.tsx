import Link from "next/link";
import Avatar from "@/components/Avatar";
import {
  IconBell,
  IconCalendar,
  IconCapsule,
  IconFeed,
  IconHome,
  IconMemorial,
  IconShield,
  IconUsers,
} from "@/components/icons";

type Person = { id: string; name: string; avatarUrl: string | null };

const rowClass =
  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-black/[0.04]";

function Badge({ count, label }: { count: number; label: string }) {
  if (count === 0) return null;
  return (
    <span
      aria-label={`${count} ${label}`}
      className="ml-auto min-w-[20px] h-5 rounded-full bg-red-600 text-white text-[11px] font-semibold flex items-center justify-center px-1.5"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

// Columna izquierda de Inicio: mi perfil, las secciones y accesos directos.
export default function ShortcutsSidebar({
  me,
  following,
  pendingRequests,
  unreadNotifications,
}: {
  me: Person;
  following: Person[];
  pendingRequests: number;
  unreadNotifications: number;
}) {
  const links = [
    { href: "/inicio", label: "Inicio", icon: IconHome, active: true },
    { href: "/dashboard", label: "Cápsulas", icon: IconCapsule },
    { href: "/dashboard/guardians", label: "Guardianes", icon: IconShield },
    {
      href: "/dashboard/connections",
      label: "Seguidores",
      icon: IconUsers,
      badge: { count: pendingRequests, label: "solicitudes pendientes" },
    },
    { href: "/dashboard/dates", label: "Fechas", icon: IconCalendar },
    { href: "/dashboard/memorial", label: "Mi página", icon: IconMemorial },
    { href: "/memorial", label: "Feed", icon: IconFeed },
    {
      href: "/dashboard/notifications",
      label: "Notificaciones",
      icon: IconBell,
      badge: { count: unreadNotifications, label: "sin leer" },
    },
  ];

  return (
    <nav aria-label="Accesos" className="flex flex-col gap-5">
      <Link
        href="/dashboard/profile"
        className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-sm hover:shadow-md"
      >
        <Avatar name={me.name} src={me.avatarUrl} />
        <span className="min-w-0">
          <span className="block font-display font-medium text-foreground truncate">
            {me.name}
          </span>
          <span className="block text-xs text-muted">Ver tu perfil</span>
        </span>
      </Link>

      <ul className="flex flex-col gap-0.5">
        {links.map(({ href, label, icon: Icon, active, badge }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={`${rowClass} ${
                active ? "bg-accent/10 font-semibold !text-accent" : ""
              }`}
            >
              <Icon className="w-5 h-5 text-accent" />
              <span>{label}</span>
              {badge && <Badge {...badge} />}
            </Link>
          </li>
        ))}
      </ul>

      <div className="border-t border-border pt-4">
        <h2 className="px-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          Tus accesos directos
        </h2>
        <ul className="mt-2 flex flex-col gap-0.5">
          <li>
            <Link href={`/memorial/${me.id}`} className={rowClass}>
              <Avatar name={me.name} src={me.avatarUrl} size="sm" />
              <span className="truncate">Mi página pública</span>
            </Link>
          </li>
          {following.map((person) => (
            <li key={person.id}>
              <Link href={`/memorial/${person.id}`} className={rowClass}>
                <Avatar name={person.name} src={person.avatarUrl} size="sm" />
                <span className="truncate">{person.name}</span>
              </Link>
            </li>
          ))}
        </ul>
        {following.length === 0 && (
          <p className="px-3 mt-2 text-xs text-muted leading-relaxed">
            Las personas que sigas aparecerán aquí.{" "}
            <Link
              href="/dashboard/connections"
              className="font-semibold text-accent hover:underline"
            >
              Buscar personas
            </Link>
          </p>
        )}
      </div>
    </nav>
  );
}
