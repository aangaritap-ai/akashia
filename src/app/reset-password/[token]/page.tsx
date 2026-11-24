"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import {
  Callout,
  inputClass,
  labelClass,
  primaryButtonClass,
} from "@/components/ui";

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
    <AuthShell
      title="Elige tu nueva contraseña"
      subtitle="Que sea fácil de recordar para ti"
    >
      {done ? (
        <Callout tone="success" className="text-center">
          Contraseña actualizada. Te llevamos a entrar...
        </Callout>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {error && (
            <Callout tone="danger" className="!py-3">
              {error}
            </Callout>
          )}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className={labelClass}>
              Nueva contraseña
            </label>
            <input
              id="password"
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputClass}
            />
            <p className="text-xs text-muted">Al menos 6 caracteres.</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`mt-1 ${primaryButtonClass}`}
          >
            {loading ? "Guardando..." : "Cambiar contraseña"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
