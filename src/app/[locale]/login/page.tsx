import { getLocale, getTranslations } from "next-intl/server";
import { Link, localizedPath } from "@/i18n/navigation";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import AuthShell from "@/components/AuthShell";
import GoogleSignIn from "@/components/GoogleSignIn";
import {
  Callout,
  inputClass,
  labelClass,
  primaryButtonClass,
} from "@/components/ui";

function safeCallback(url: string | undefined) {
  return url && url.startsWith("/") && !url.startsWith("//") ? url : "/inicio";
}

export default async function LoginPage({
  searchParams,
}: PageProps<"/[locale]/login">) {
  const params = await searchParams;
  const t = await getTranslations("auth");
  const common = await getTranslations("common");
  const locale = await getLocale();
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
        redirectTo: localizedPath(dest, locale),
      });
    } catch (err) {
      if (err instanceof AuthError) {
        redirect(
          localizedPath(
            `/login?error=1&callbackUrl=${encodeURIComponent(dest)}`,
            locale
          )
        );
      }
      throw err;
    }
  }

  return (
    <AuthShell
      title={t("loginTitle")}
      subtitle={t("loginSubtitle")}
      footer={
        <p>
          {t("noAccount")}{" "}
          <Link
            href={`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}&email=${encodeURIComponent(prefillEmail)}`}
            className="text-accent font-semibold hover:underline"
          >
            {t("createOne")}
          </Link>
        </p>
      }
    >
      {error && (
        <Callout tone="danger" className="!py-3">
          {error === "1" ? t("badCredentials") : t("googleFailed")}
        </Callout>
      )}

      <GoogleSignIn callbackUrl={callbackUrl} />

      <form action={login} className="flex flex-col gap-4">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className={labelClass}>
            {common("email")}
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
              {common("password")}
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-accent hover:underline"
            >
              {t("forgotLink")}
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
          {common("signIn")}
        </button>
      </form>
    </AuthShell>
  );
}
