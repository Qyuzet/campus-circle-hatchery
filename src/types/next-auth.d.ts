// Extend NextAuth types with custom fields
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      studentId: string;
      faculty: string;
      major: string;
      image?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    studentId: string;
    faculty?: string;
    major?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    studentId: string;
  }
}

