// src/lib/auth/config.ts
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { loginSchema } from "@/lib/validations/auth.schema";

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID     ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return { id: user.id, email: user.email!, name: user.name, image: user.image };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error:  "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.dbId) session.user.id = token.dbId as string;
      else if (token.sub) session.user.id = token.sub;
      return session;
    },
    async jwt({ token, user, account, profile }) {
      // On credentials sign-in, user.id is already the DB id
      if (user?.id) {
        token.dbId = user.id;
        return token;
      }

      // On Google sign-in, look up (or create) the DB user by email
      if (account?.provider === "google" && profile?.email) {
        let dbUser = await prisma.user.findUnique({ where: { email: profile.email } });

        if (!dbUser) {
          // First-time Google sign-in — create the user
          dbUser = await prisma.user.create({
            data: {
              email: profile.email,
              name:  (profile as { name?: string }).name ?? profile.email,
              image: (profile as { picture?: string }).picture ?? null,
              // no password — Google-only account
            },
          });
        }

        token.dbId = dbUser.id;
      }

      return token;
    },
  },
  session: { strategy: "jwt" },
};
