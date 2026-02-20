import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { logger } from "./logger";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          logger.warn("Login attempt without credentials");
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          logger.warn("Login attempt with non-existent email", {
            email: credentials.email,
          });
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isPasswordValid) {
          logger.warn("Login attempt with invalid password", {
            email: credentials.email,
            userId: user.id,
          });
          return null;
        }

        logger.info("User logged in successfully", {
          userId: user.id,
          email: user.email,
          role: user.role,
        });

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as
          | "USER"
          | "AUTHOR"
          | "MODERATOR"
          | "ADMIN"
          | "SUPERADMIN";
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
