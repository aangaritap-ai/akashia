import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const params = await searchParams;
  const error = params?.error;

  async function login(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: "/dashboard",
      });
    } catch (err) {
      if (err instanceof AuthError) {
        redirect("/login?error=1");
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
          <p className="text-muted text-sm mt-2">Entra a tu cuenta</p>
        </div>

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            Correo o contraseña incorrectos.
          </div>
        )}

        <form action={login} className="flex flex-col gap-4">
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
              required
              className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>
          <button
            type="submit"
            className="mt-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-background hover:brightness-110"
          >
            Entrar
          </button>
        </form>

        <p className="text-center text-sm text-muted">
          <Link href="/forgot-password" className="text-accent">
            ¿Olvidaste tu contraseña?
          </Link>
        </p>

        <p className="text-center text-sm text-muted">
          ¿No tienes cuenta?{" "}
          <Link href="/signup" className="text-accent">
            Crea una
          </Link>
        </p>
      </div>
    </main>
  );
}
