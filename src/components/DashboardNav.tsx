"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconCapsule,
  IconShield,
  IconMemorial,
  IconFeed,
} from "@/components/icons";

const items = [
  { href: "/dashboard", label: "Cápsulas", icon: IconCapsule, exact: true },
  { href: "/dashboard/guardians", label: "Guardianes", icon: IconShield },
  { href: "/dashboard/memorial", label: "Memorial", icon: IconMemorial },
  { href: "/memorial", label: "Feed", icon: IconFeed },
];

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-around sm:justify-center gap-1 w-full overflow-x-auto">
      {items.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[11px] whitespace-nowrap ${
              active
                ? "bg-accent/10 text-accent"
                : "text-muted hover:text-foreground hover:bg-black/[0.03]"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
