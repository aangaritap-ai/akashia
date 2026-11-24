import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import AuthShell from "@/components/AuthShell";
import {
  Callout,
  inputClass,
  labelClass,
  primaryButtonClass,
} from "@/components/ui";

function safeCallback(url: string | undefined) {
  return url && url.startsWith("/") && !url.startsWith("//") ? url : "/dashboard";
}

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const params = await searchParams;
  const error = params?.error;
  const callbackUrl = safeCallback(
    typeof params?.callbackUrl === "string" ? params.callbackUrl : undefined
  );
  const prefillEmail =
    typeof params?.email === "string" ? params.email : "";

  async function login(formData: FormData) {
    "use server";
    const dest = safeCallback(formData.get("callbackUrl") as string);
    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: dest,
      });
    } catch (err) {
      if (err instanceof AuthError) {
        redirect(`/login?error=1&callbackUrl=${encodeURIComponent(dest)}`);
      }
      throw err;
    }
  }

  return (
    <AuthShell
      title="Bienvenido de nuevo"
      subtitle="Entra a tu cuenta"
      footer={
        <p>
          ¿No tienes cuenta?{" "}
          <Link
            href={`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}&email=${encodeURIComponent(prefillEmail)}`}
            className="text-accent font-semibold hover:underline"
          >
            Crea una
          </Link>
        </p>
      }
    >
      {error && (
        <Callout tone="danger" className="!py-3">
          Correo o contraseña incorrectos.
        </Callout>
      )}

      <form action={login} className="flex flex-col gap-4">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
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
          <div className="flex items-baseline justify-between">
            <label htmlFor="password" className={labelClass}>
              Contraseña
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-accent hover:underline"
            >
              ¿La olvidaste?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            required
            className={inputClass}
          />
        </div>
        <button type="submit" className={`mt-1 ${primaryButtonClass}`}>
          Entrar
        </button>
      </form>
    </AuthShell>
  );
}
