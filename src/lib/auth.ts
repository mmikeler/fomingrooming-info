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

        // Проверка верификации email
        if (!user.emailVerified) {
          logger.warn("Login attempt with unverified email", {
            email: credentials.email,
            userId: user.id,
          });
          throw new Error("EMAIL_NOT_VERIFIED");
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
          city: user.city || null,
          phone: user.phone || null,
          image: user.avatar || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.city = user.city || null;
        token.phone = user.phone || null;
        token.image = user.image || null;
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
        session.user.city = token.city as string | null;
        session.user.phone = token.phone as string | null;
        session.user.image = token.image as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
