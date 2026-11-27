"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import MailLanguageSelect from "@/components/MailLanguageSelect";
import { Callout, inputClass, primaryButtonClass } from "@/components/ui";

type FoundUser = { id: string; name: string; email: string };

export default function AddGuardianForm() {
  const router = useRouter();
  const t = useTranslations("guardians");
  const common = useTranslations("common");
  const followers = useTranslations("followers");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const pageLocale = useLocale();
  const [mailLocale, setMailLocale] = useState(pageLocale);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [results, setResults] = useState<FoundUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (search.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const res = await fetch(
        `/api/users/search?q=${encodeURIComponent(search.trim())}`
      );
      const data = await res.json().catch(() => ({ users: [] }));
      setResults(data.users || []);
      setSearching(false);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  function pickUser(u: FoundUser) {
    setName(u.name);
    setEmail(u.email);
    setSearch("");
    setResults([]);
    setShowResults(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setWarning(null);
    setNotice(null);

    const res = await fetch("/api/guardians", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, locale: mailLocale }),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error || t("addFailed"));
      return;
    }

    if (data.emailError) {
      setWarning(data.emailError);
    } else if (data.notified) {
      setNotice(t("alsoNotified"));
    }

    setName("");
    setEmail("");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="reveal rounded-2xl border border-border bg-surface p-5 flex flex-col gap-3 shadow-sm"
    >
      <div className="font-display text-lg text-foreground">
        {t("add")}
      </div>
      {error && <Callout tone="danger" className="!py-3">{error}</Callout>}
      {warning && <Callout tone="warning" className="!py-3">{warning}</Callout>}
      {notice && <Callout tone="success" className="!py-3">{notice}</Callout>}

      <div className="relative">
        <label className="text-xs text-muted">
          {t("searchHint")}
        </label>
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 150)}
          placeholder={t("searchPlaceholder")}
          className={`mt-1 ${inputClass}`}
        />
        {showResults && (searching || results.length > 0) && (
          <div className="absolute z-10 mt-1 w-full rounded-xl border border-border bg-surface shadow-lg overflow-hidden">
            {searching ? (
              <div className="px-4 py-2.5 text-sm text-muted">
                {followers("searching")}
              </div>
            ) : (
              results.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onMouseDown={() => pickUser(u)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-black/[0.03] flex flex-col"
                >
                  <span className="text-foreground font-medium">
                    {u.name}
                  </span>
                  <span className="text-muted text-xs">{u.email}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted">
        <div className="h-px flex-1 bg-border" />
        {t("orManual")}
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={common("name")}
          required
          className={`flex-1 ${inputClass}`}
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder={common("email")}
          required
          className={`flex-1 ${inputClass}`}
        />
        <button
          type="submit"
          disabled={loading}
          className={`${primaryButtonClass} whitespace-nowrap`}
        >
          {loading ? common("sending") : t("invite")}
        </button>
      </div>
      <MailLanguageSelect value={mailLocale} onChange={setMailLocale} />
    </form>
  );
}
