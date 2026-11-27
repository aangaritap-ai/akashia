"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { IconBell } from "@/components/icons";
import NotificationList from "@/components/notifications/NotificationList";

const PAGE = "/dashboard/notifications";

// La campana del encabezado. En pantallas anchas abre un panel encima de la
// página; en el celular lleva a la página de notificaciones.
export default function NotificationBell({ unread }: { unread: number }) {
  const pathname = usePathname();
  // La ruta donde se abrió: al cambiar de página, el panel queda cerrado.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const box = useRef<HTMLDivElement>(null);
  const t = useTranslations("notifications");

  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpenOn(null);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenOn(null);
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return (
    <div ref={box} className="relative">
      <Link
        href={PAGE}
        aria-label={
          unread > 0 ? t("bellUnread", { count: unread }) : t("title")
        }
        aria-expanded={open}
        onClick={(e) => {
          const modified = e.metaKey || e.ctrlKey || e.shiftKey;
          const wide = window.matchMedia("(min-width: 640px)").matches;
          if (pathname === PAGE || modified || !wide) return;
          e.preventDefault();
          setOpenOn(open ? null : pathname);
        }}
        className={`relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/[0.04] ${
          open ? "bg-accent/10 text-accent" : "text-muted hover:text-foreground"
        }`}
      >
        <IconBell />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-[16px] rounded-full bg-red-600 text-white text-[9px] font-semibold flex items-center justify-center px-0.5 ring-2 ring-background">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </Link>

      {open && (
        <div
          role="dialog"
          aria-label={t("title")}
          className="absolute right-0 top-11 z-30 w-[380px] max-h-[calc(100vh-5rem)] overflow-y-auto overscroll-contain rounded-2xl border border-border bg-surface p-2 pt-3 shadow-xl"
        >
          <NotificationList panel onNavigate={() => setOpenOn(null)} />
        </div>
      )}
    </div>
  );
}
