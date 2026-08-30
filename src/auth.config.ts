import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";
import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "./lib/schema";
import bcrypt from "bcryptjs";
import { encode } from "next-auth/jwt";

const adapter = PrismaAdapter(prisma);

export default {
  adapter,
  providers: [
    Google,
    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "Enter your email",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter your password",
        },
      },
      authorize: async (credentials) => {
            if (!credentials) {
                throw new Error("Missing credentials");
            }

            const result = loginSchema.safeParse(credentials);
            if (!result.success) {
                throw new Error(result.error.message);
            }
            const validatedCredentials = result.data;

            const user = await prisma.user.findUnique({
                where: { email: validatedCredentials.email },
            });

            if (!user) {
                throw new Error("No user found with the provided email.");
            }

            const isValidPassword = await bcrypt.compare(
                validatedCredentials.password,
                user.password as string
            );

            if (!isValidPassword) {
                throw new Error("Invalid email/password.");
            }

            return user;
        }
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account?.provider === "google" && profile?.picture) {
        token.picture = profile.picture;
      }

      if (account?.provider === "credentials" || (!account && token.credentials)) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { image: true },
        });
        token.picture = dbUser?.image || null;
      }

      if (account?.provider === "credentials") {
        token.credentials = true;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.image = token.picture as string | null;
      }
      return session;
    }
  },

  jwt: {
    encode: async (params) => encode(params),
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;
