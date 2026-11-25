import Link from "next/link";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import AuthShell from "@/components/AuthShell";
import {
  Callout,
  inputClass,
  labelClass,
  primaryButtonClass,
} from "@/components/ui";

function safeCallback(url: string | undefined) {
  return url && url.startsWith("/") && !url.startsWith("//") ? url : "/inicio";
}

export default async function SignupPage({
  searchParams,
}: PageProps<"/signup">) {
  const params = await searchParams;
  const error = params?.error;
  const callbackUrl = safeCallback(
    typeof params?.callbackUrl === "string" ? params.callbackUrl : undefined
  );
  const prefillEmail = typeof params?.email === "string" ? params.email : "";

  async function signup(formData: FormData) {
    "use server";

    const dest = safeCallback(formData.get("callbackUrl") as string);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase();
    const password = String(formData.get("password") || "");

    if (!name || !email || password.length < 6) {
      redirect(
        `/signup?error=invalid&callbackUrl=${encodeURIComponent(dest)}&email=${encodeURIComponent(email)}`
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      redirect(
        `/signup?error=exists&callbackUrl=${encodeURIComponent(dest)}&email=${encodeURIComponent(email)}`
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { name, email, passwordHash } });

    try {
      await signIn("credentials", {
        email,
        password,
        redirectTo: dest,
      });
    } catch (err) {
      if (err instanceof AuthError) {
        redirect("/login");
      }
      throw err;
    }
  }

  return (
    <AuthShell
      title="Crea tu cuenta"
      subtitle="Deja tu huella en quienes amas"
      footer={
        <p>
          ¿Ya tienes cuenta?{" "}
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}&email=${encodeURIComponent(prefillEmail)}`}
            className="text-accent font-semibold hover:underline"
          >
            Entra
          </Link>
        </p>
      }
    >
      {error === "exists" && (
        <Callout tone="danger" className="!py-3">
          Ya existe una cuenta con ese correo.{" "}
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}&email=${encodeURIComponent(prefillEmail)}`}
            className="underline"
          >
            Entra en su lugar
          </Link>
          .
        </Callout>
      )}
      {error === "invalid" && (
        <Callout tone="danger" className="!py-3">
          Revisa tus datos — la contraseña necesita al menos 6 caracteres.
        </Callout>
      )}

      <form action={signup} className="flex flex-col gap-4">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className={labelClass}>
            Nombre
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className={labelClass}>
            Correo
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={prefillEmail}
            required
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className={labelClass}>
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            minLength={6}
            required
            className={inputClass}
          />
          <p className="text-xs text-muted">Al menos 6 caracteres.</p>
        </div>
        <button type="submit" className={`mt-1 ${primaryButtonClass}`}>
          Crear cuenta
        </button>
      </form>
    </AuthShell>
  );
}
