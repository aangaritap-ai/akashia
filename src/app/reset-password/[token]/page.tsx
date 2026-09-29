"use client";

import Link from "next/link";
import { use, useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage({
  params,
}: PageProps<"/reset-password/[token]">) {
  const { token } = use(params);
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/password-reset/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "No se pudo cambiar la contraseña");
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <Link href="/" className="font-display text-2xl text-foreground">
            Akashia
          </Link>
          <p className="text-muted text-sm mt-2">Elige tu nueva contraseña</p>
        </div>

        {done ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800 text-center">
            Contraseña actualizada. Te llevamos a entrar...
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {error}
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm text-muted">
                Nueva contraseña
              </label>
              <input
                id="password"
                type="password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-background hover:brightness-110 disabled:opacity-60"
            >
              {loading ? "Guardando..." : "Cambiar contraseña"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
