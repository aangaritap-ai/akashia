"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  IconCapsule,
  IconShield,
  IconMemorial,
  IconUsers,
  IconCalendar,
  IconHome,
  IconPaw,
} from "@/components/icons";

const items = [
  { href: "/inicio", label: "home", icon: IconHome },
  { href: "/dashboard", label: "capsules", icon: IconCapsule, exact: true },
  { href: "/dashboard/guardians", label: "guardians", icon: IconShield },
  { href: "/dashboard/connections", label: "followers", icon: IconUsers },
  { href: "/dashboard/dates", label: "dates", icon: IconCalendar },
  { href: "/dashboard/pets", label: "pets", icon: IconPaw },
  { href: "/dashboard/memorial", label: "myPage", icon: IconMemorial },
] as const;

export default function DashboardNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav className="flex items-center justify-around md:justify-center sm:gap-1 w-full overflow-x-auto">
      {items.map((item) => {
        const active = "exact" in item
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            title={t(item.label)}
            className={`flex flex-col items-center gap-0.5 px-0.5 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] whitespace-nowrap ${
              active
                ? "bg-accent/10 text-accent"
                : "text-muted hover:text-foreground hover:bg-black/[0.03]"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{t(item.label)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
