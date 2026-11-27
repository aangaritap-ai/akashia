import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Avatar from "@/components/Avatar";
import {
  IconBell,
  IconCalendar,
  IconCapsule,
  IconHome,
  IconMemorial,
  IconPaw,
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
      aria-label={label}
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
  const t = useTranslations("home");
  const section = useTranslations("nav");
  const links = [
    { href: "/inicio", label: section("home"), icon: IconHome, active: true },
    { href: "/dashboard", label: section("capsules"), icon: IconCapsule },
    {
      href: "/dashboard/guardians",
      label: section("guardians"),
      icon: IconShield,
    },
    {
      href: "/dashboard/connections",
      label: section("followers"),
      icon: IconUsers,
      badge: {
        count: pendingRequests,
        label: t("pendingBadge", { count: pendingRequests }),
      },
    },
    { href: "/dashboard/dates", label: section("dates"), icon: IconCalendar },
    { href: "/dashboard/pets", label: section("pets"), icon: IconPaw },
    {
      href: "/dashboard/memorial",
      label: section("myPage"),
      icon: IconMemorial,
    },
    {
      href: "/dashboard/notifications",
      label: section("notifications"),
      icon: IconBell,
      badge: {
        count: unreadNotifications,
        label: t("unreadBadge", { count: unreadNotifications }),
      },
    },
  ];

  return (
    <nav aria-label={t("shortcutsLabel")} className="flex flex-col gap-5">
      <Link
        href="/dashboard/profile"
        className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-sm hover:shadow-md"
      >
        <Avatar name={me.name} src={me.avatarUrl} />
        <span className="min-w-0">
          <span className="block font-display font-medium text-foreground truncate">
            {me.name}
          </span>
          <span className="block text-xs text-muted">{t("viewProfile")}</span>
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
          {t("yourShortcuts")}
        </h2>
        <ul className="mt-2 flex flex-col gap-0.5">
          <li>
            <Link href={`/memorial/${me.id}`} className={rowClass}>
              <Avatar name={me.name} src={me.avatarUrl} size="sm" />
              <span className="truncate">{t("publicPage")}</span>
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
            {t("followingHint")}{" "}
            <Link
              href="/dashboard/connections"
              className="font-semibold text-accent hover:underline"
            >
              {t("findPeople")}
            </Link>
          </p>
        )}
      </div>
    </nav>
  );
}
