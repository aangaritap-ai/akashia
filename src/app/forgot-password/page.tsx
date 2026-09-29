"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/password-reset/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setSent(true);
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <Link href="/" className="font-display text-2xl text-foreground">
            Akashia
          </Link>
          <p className="text-muted text-sm mt-2">Recupera tu contraseña</p>
        </div>

        {sent ? (
          <div className="rounded-xl border border-border bg-surface px-5 py-4 text-sm text-muted text-center">
            Si ese correo tiene una cuenta, te enviamos un enlace para elegir
            una nueva contraseña. Revisa tu bandeja (y spam).
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm text-muted">
                Correo
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-background hover:brightness-110 disabled:opacity-60"
            >
              {loading ? "Enviando..." : "Enviar enlace"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-muted">
          <Link href="/login" className="text-accent">
            Volver a entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
