import Link from "next/link";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";

export default async function SignupPage({
  searchParams,
}: PageProps<"/signup">) {
  const params = await searchParams;
  const error = params?.error;

  async function signup(formData: FormData) {
    "use server";

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase();
    const password = String(formData.get("password") || "");

    if (!name || !email || password.length < 6) {
      redirect("/signup?error=invalid");
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      redirect("/signup?error=exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { name, email, passwordHash } });

    try {
      await signIn("credentials", {
        email,
        password,
        redirectTo: "/dashboard",
      });
    } catch (err) {
      if (err instanceof AuthError) {
        redirect("/login");
      }
      throw err;
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <Link href="/" className="font-display text-2xl text-foreground">
            Akashia
          </Link>
          <p className="text-muted text-sm mt-2">Crea tu cuenta</p>
        </div>

        {error === "exists" && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            Ya existe una cuenta con ese correo.
          </div>
        )}
        {error === "invalid" && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            Revisa tus datos — la contraseña necesita al menos 6 caracteres.
          </div>
        )}

        <form action={signup} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm text-muted">
              Nombre
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm text-muted">
              Correo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm text-muted">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              minLength={6}
              required
              className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>
          <button
            type="submit"
            className="mt-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-background hover:brightness-110"
          >
            Crear cuenta
          </button>
        </form>

        <p className="text-center text-sm text-muted">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-accent">
            Entra
          </Link>
        </p>
      </div>
    </main>
  );
}
