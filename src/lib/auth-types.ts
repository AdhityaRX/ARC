import "next-auth";
import "@auth/core/jwt";

declare module "next-auth" {
  interface User {
    role?: "super_admin" | "hr" | "user";
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: "super_admin" | "hr" | "user";
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: "super_admin" | "hr" | "user";
    id?: string;
  }
}
