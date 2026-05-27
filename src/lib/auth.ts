import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { logger } from "./logger";
import Yandex from "next-auth/providers/yandex";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    Yandex({
      clientId: "ac83984321d845149585437fcac09dde",
      clientSecret: "f3ac94a94c7e4e8cab2250182eb33afe",
    }),
    // Провайдер для входа через VK ID по slug
    CredentialsProvider({
      id: "vk",
      name: "VK ID",
      credentials: {
        slug: { label: "Slug", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.slug) {
          logger.warn("VK login attempt without slug");
          return null;
        }

        // Только для VK slug
        if (!credentials.slug.startsWith("vk-")) {
          logger.warn("Invalid VK slug format", {
            slug: credentials.slug,
          });
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { slug: credentials.slug },
        });

        if (!user) {
          logger.warn("VK login attempt with non-existent slug", {
            slug: credentials.slug,
          });
          return null;
        }

        // Проверка статуса
        if (user.status === "BANNED") {
          logger.warn("VK login attempt with banned account", {
            userId: user.id,
            slug: user.slug,
            banReason: user.banReason,
          });
          throw new Error(
            user.banReason
              ? `ACCOUNT_BANNED:${user.banReason}`
              : "ACCOUNT_BANNED",
          );
        }

        logger.info("VK user logged in successfully", {
          userId: user.id,
          slug: user.slug,
          role: user.role,
        });

        return {
          id: user.id.toString(),
          slug: user.slug,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          city: user.city || null,
          phone: user.phone || null,
          image: user.avatar || null,
        };
      },
    }),
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

        // Проверка статуса аккаунта
        if (user.status === "BANNED") {
          logger.warn("Login attempt with banned account", {
            email: credentials.email,
            userId: user.id,
            banReason: user.banReason,
          });
          // Включаем причину бана в сообщение об ошибке
          throw new Error(
            user.banReason
              ? `ACCOUNT_BANNED:${user.banReason}`
              : "ACCOUNT_BANNED",
          );
        }

        logger.info("User logged in successfully", {
          userId: user.id,
          email: user.email,
          role: user.role,
        });

        return {
          id: user.id.toString(),
          slug: user.slug,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          city: user.city || null,
          phone: user.phone || null,
          image: user.avatar || null,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // При входе через Яндекс провайдер перенаправляем новых пользователей
      // на страницу регистрации
      if (account?.provider === "yandex" && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          logger.info("Redirecting new Yandex user to registration", {
            email: user.email,
          });
          // Возвращаем URL для перенаправления на страницу регистрации с pre-filled email
          return `/auth/signup?email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(user.name || "")}&provider=yandex`;
        }

        // Для существующего пользователя - подтягиваем slug
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: {
            id: true,
            slug: true,
            email: true,
            name: true,
            role: true,
            status: true,
          },
        });

        if (dbUser && dbUser.slug) {
          user.slug = dbUser.slug;
          user.role = dbUser.role;
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.slug = user.slug;
        token.role = user.role;
        token.status = user.status;
        token.city = user.city || null;
        token.phone = user.phone || null;
        token.image = user.image || null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.slug = token.slug as string;
        session.user.role = token.role as
          | "USER"
          | "AUTHOR"
          | "MODERATOR"
          | "ADMIN"
          | "SUPERADMIN";
        session.user.status = token.status as
          | "ACTIVE"
          | "RESTRICTED"
          | "BANNED";
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
