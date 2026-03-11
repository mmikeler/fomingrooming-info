import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: "USER" | "AUTHOR" | "MODERATOR" | "ADMIN" | "SUPERADMIN";
      city?: string | null;
      phone?: string | null;
    };
  }

  interface JWT {
    id: string;
    role: "USER" | "AUTHOR" | "MODERATOR" | "ADMIN" | "SUPERADMIN";
    city?: string | null;
    phone?: string | null;
    image?: string | null;
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: "USER" | "AUTHOR" | "MODERATOR" | "ADMIN" | "SUPERADMIN";
    city?: string | null;
    phone?: string | null;
    image?: string | null;
  }
}
