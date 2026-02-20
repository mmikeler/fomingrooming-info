import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: "USER" | "AUTHOR" | "MODERATOR" | "ADMIN" | "SUPERADMIN";
    };
  }

  interface JWT {
    id: string;
    role: "USER" | "AUTHOR" | "MODERATOR" | "ADMIN" | "SUPERADMIN";
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: "USER" | "AUTHOR" | "MODERATOR" | "ADMIN" | "SUPERADMIN";
  }
}
