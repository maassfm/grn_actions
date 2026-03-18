import "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    teamId?: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      teamId: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    teamId?: string | null;
  }
}
