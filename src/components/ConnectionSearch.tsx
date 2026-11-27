"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import Avatar from "@/components/Avatar";
import FollowButton from "@/components/FollowButton";
import { inputClass } from "@/components/ui";
import type { FollowState } from "@/lib/connections";

type Found = {
  id: string;
  name: string;
  avatarUrl: string | null;
  state: FollowState;
  connectionId: string | null;
};

export default function ConnectionSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Found[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(0);
  const t = useTranslations("followers");

  function onChange(value: string) {
    setQuery(value);
    if (timer.current) clearTimeout(timer.current);

    if (value.trim().length < 2) {
      latest.current++;
      setResults([]);
      setSearched(false);
      setSearching(false);
      return;
    }

    setSearching(true);
    timer.current = setTimeout(async () => {
      const mine = ++latest.current;
      try {
        const res = await fetch(
          `/api/connections/search?q=${encodeURIComponent(value.trim())}`
        );
        const data = await res.json().catch(() => ({ users: [] }));
        if (mine !== latest.current) return; // llegó una respuesta más nueva
        setResults(data.users || []);
        setSearched(true);
      } finally {
        if (mine === latest.current) setSearching(false);
      }
    }, 300);
  }

  return (
    <div className="reveal rounded-2xl border border-border bg-surface p-5 flex flex-col gap-3 shadow-sm">
      <div className="font-display text-lg text-foreground">
        {t("search")}
      </div>
      <input
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("searchPlaceholder")}
        aria-label={t("searchLabel")}
        className={inputClass}
      />

      {searching && <div className="text-sm text-muted">{t("searching")}</div>}

      {!searching && searched && results.length === 0 && (
        <div className="text-sm text-muted">
          {t("noResults")}
        </div>
      )}

      {results.length > 0 && (
        <div className="flex flex-col divide-y divide-border">
          {results.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between gap-4 py-3"
            >
              <Link
                href={`/memorial/${u.id}`}
                className="flex items-center gap-3 min-w-0 hover:underline"
              >
                <Avatar name={u.name} src={u.avatarUrl} size="md" />
                <span className="font-medium text-foreground truncate">
                  {u.name}
                </span>
              </Link>
              <FollowButton
                userId={u.id}
                initialState={u.state}
                initialConnectionId={u.connectionId}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
