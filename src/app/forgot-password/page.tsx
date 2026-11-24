"use client";

import Link from "next/link";
import { useState } from "react";
import AuthShell from "@/components/AuthShell";
import {
  Callout,
  inputClass,
  labelClass,
  primaryButtonClass,
} from "@/components/ui";

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
    <AuthShell
      title="Recupera tu contraseña"
      subtitle="Te enviamos un enlace a tu correo"
      footer={
        <p>
          <Link
            href="/login"
            className="text-accent font-semibold hover:underline"
          >
            Volver a entrar
          </Link>
        </p>
      }
    >
      {sent ? (
        <Callout tone="success" className="text-center">
          Si ese correo tiene una cuenta, te enviamos un enlace para elegir
          una nueva contraseña. Revisa tu bandeja (y spam).
        </Callout>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className={labelClass}>
              Correo
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`mt-1 ${primaryButtonClass}`}
          >
            {loading ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
