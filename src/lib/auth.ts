import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { accountForGoogle } from "@/lib/google-account";

// El botón y el proveedor solo existen si están las dos claves de Google.
export const googleEnabled = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
);

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastActiveAt: new Date() },
        });

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
    ...(googleEnabled ? [Google] : []),
  ],
  callbacks: {
    // Con Google: solo correos verificados, y se busca o crea la cuenta.
    signIn: async ({ account, profile }) => {
      if (account?.provider !== "google") return true;
      if (profile?.email_verified !== true || !profile.email) return false;
      const own = await accountForGoogle({
        googleId: account.providerAccountId,
        email: profile.email,
        name: profile.name,
      });
      return own !== null;
    },
    jwt: async ({ token, user, account }) => {
      if (account?.provider === "google") {
        // La sesión debe llevar el id de Akashia, no el que genera Auth.js.
        const own = await prisma.user.findUnique({
          where: { googleId: account.providerAccountId },
          select: { id: true, name: true, email: true },
        });
        if (!own) return null;
        return { ...token, id: own.id, name: own.name, email: own.email };
      }
      if (user) token.id = user.id;
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
});
