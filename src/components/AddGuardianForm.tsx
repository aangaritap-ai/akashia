"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type FoundUser = { id: string; name: string; email: string };

export default function AddGuardianForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

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

    const res = await fetch("/api/guardians", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "No se pudo añadir el guardián");
      return;
    }

    if (data.emailError) {
      setWarning(data.emailError);
    }

    setName("");
    setEmail("");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-border bg-surface p-5 flex flex-col gap-3 shadow-sm"
    >
      <div className="text-sm font-semibold text-foreground">
        Añadir guardián
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      {warning && (
        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {warning}
        </div>
      )}

      <div className="relative">
        <label className="text-xs text-muted">
          ¿Ya tiene cuenta en Akashia? Búscalo por nombre o correo
        </label>
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 150)}
          placeholder="Buscar por nombre o correo"
          className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
        />
        {showResults && (searching || results.length > 0) && (
          <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-surface shadow-lg overflow-hidden">
            {searching ? (
              <div className="px-4 py-2.5 text-sm text-muted">
                Buscando...
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
        o ingresa los datos manualmente
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre"
          required
          className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Correo"
          required
          className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-background hover:brightness-110 disabled:opacity-60 whitespace-nowrap"
        >
          {loading ? "Enviando..." : "Invitar"}
        </button>
      </div>
    </form>
  );
}
