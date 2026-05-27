import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findFirst({
          where: { email: credentials.email as string },
          include: { tenant: true },
        });

        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          tenantId: user.tenantId,
          tenantName: user.tenant.name,
          role: user.role,
        };
      },
    }),
    // Google: add GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET to env to enable
    ...(process.env.GOOGLE_CLIENT_ID
      ? [
          (await import("next-auth/providers/google")).default({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            async profile(profile) {
              return {
                id: profile.sub,
                name: profile.name,
                email: profile.email,
                image: profile.picture,
              };
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Google first login: create Tenant + User OWNER
      if (account?.provider === "google" && user.email) {
        const existing = await prisma.user.findFirst({
          where: { email: user.email },
        });
        if (!existing) {
          const slug = user.email
            .split("@")[0]
            .replace(/[^a-z0-9]/gi, "-")
            .toLowerCase()
            .concat("-" + Math.random().toString(36).slice(2, 6));

          const tenant = await prisma.tenant.create({
            data: {
              name: user.name ?? "Meu Salão",
              slug,
              plan: "BASIC",
              trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            },
          });
          const newUser = await prisma.user.create({
            data: {
              tenantId: tenant.id,
              email: user.email,
              name: user.name ?? "Proprietária",
              role: "OWNER",
            },
          });
          user.id = newUser.id;
          user.tenantId = tenant.id;
          user.tenantName = tenant.name;
          user.role = "OWNER";
        } else {
          const tenant = await prisma.tenant.findUnique({
            where: { id: existing.tenantId },
          });
          user.id = existing.id;
          user.tenantId = existing.tenantId;
          user.tenantName = tenant?.name ?? "";
          user.role = existing.role;
        }
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.tenantId = user.tenantId;
        token.tenantName = user.tenantName;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub!;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const t = token as any;
      session.user.tenantId = t.tenantId as string;
      session.user.tenantName = t.tenantName as string;
      session.user.role = t.role as string;
      return session;
    },
  },
});
