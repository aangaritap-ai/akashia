"use client";

import { useRouter } from "next/navigation";
import { IconChevronLeft, IconChevronRight } from "@/components/icons";

export default function NavHistoryButtons() {
  const router = useRouter();

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Atrás"
        className="w-8 h-8 flex items-center justify-center rounded-full text-muted hover:text-foreground hover:bg-black/[0.04]"
      >
        <IconChevronLeft />
      </button>
      <button
        type="button"
        onClick={() => router.forward()}
        aria-label="Adelante"
        className="w-8 h-8 flex items-center justify-center rounded-full text-muted hover:text-foreground hover:bg-black/[0.04]"
      >
        <IconChevronRight />
      </button>
    </div>
  );
}
