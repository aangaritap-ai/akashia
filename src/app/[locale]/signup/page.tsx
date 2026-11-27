import { getLocale, getTranslations } from "next-intl/server";
import { Link, localizedPath } from "@/i18n/navigation";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
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

export default async function SignupPage({
  searchParams,
}: PageProps<"/[locale]/signup">) {
  const params = await searchParams;
  const t = await getTranslations("auth");
  const common = await getTranslations("common");
  const locale = await getLocale();
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
        localizedPath(
          `/signup?error=invalid&callbackUrl=${encodeURIComponent(dest)}&email=${encodeURIComponent(email)}`,
          locale
        )
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      redirect(
        localizedPath(
          `/signup?error=exists&callbackUrl=${encodeURIComponent(dest)}&email=${encodeURIComponent(email)}`,
          locale
        )
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { name, email, passwordHash, locale },
    });

    try {
      await signIn("credentials", {
        email,
        password,
        redirectTo: localizedPath(dest, locale),
      });
    } catch (err) {
      if (err instanceof AuthError) {
        redirect(localizedPath("/login", locale));
      }
      throw err;
    }
  }

  return (
    <AuthShell
      title={t("signupTitle")}
      subtitle={t("signupSubtitle")}
      footer={
        <p>
          {t("haveAccount")}{" "}
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}&email=${encodeURIComponent(prefillEmail)}`}
            className="text-accent font-semibold hover:underline"
          >
            {t("logInShort")}
          </Link>
        </p>
      }
    >
      {error === "exists" && (
        <Callout tone="danger" className="!py-3">
          {t("emailExists")}{" "}
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}&email=${encodeURIComponent(prefillEmail)}`}
            className="underline"
          >
            {t("logInInstead")}
          </Link>
          .
        </Callout>
      )}
      {error === "invalid" && (
        <Callout tone="danger" className="!py-3">
          {t("invalidSignup")}
        </Callout>
      )}

      <GoogleSignIn callbackUrl={callbackUrl} />

      <form action={signup} className="flex flex-col gap-4">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className={labelClass}>
            {common("name")}
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
          <label htmlFor="password" className={labelClass}>
            {common("password")}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            minLength={6}
            required
            className={inputClass}
          />
          <p className="text-xs text-muted">{common("minPassword")}</p>
        </div>
        <button type="submit" className={`mt-1 ${primaryButtonClass}`}>
          {common("createAccount")}
        </button>
      </form>
    </AuthShell>
  );
}
