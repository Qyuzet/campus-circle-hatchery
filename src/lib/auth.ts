// NextAuth Configuration for CampusCircle
import NextAuth, { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          // Only allow Binus emails
          hd: "binus.ac.id",
        },
      },
    }),
    // Temporary credentials provider for development
    CredentialsProvider({
      name: "Student ID",
      credentials: {
        studentId: {
          label: "Student ID",
          type: "text",
          placeholder: "2501234567",
        },
      },
      async authorize(credentials) {
        if (!credentials?.studentId) return null;

        const studentId = credentials.studentId as string;

        // For development: create or find user by student ID
        let user = await prisma.user.findUnique({
          where: { studentId },
        });

        if (!user) {
          // Create a new user for development
          user = await prisma.user.create({
            data: {
              studentId,
              email: `${studentId}@binus.ac.id`,
              name: `Student ${studentId}`,
              faculty: "Computer Science",
              major: "Computer Science",
              year: 3,
            },
          });

          // Create user stats
          await prisma.userStats.create({
            data: {
              userId: user.id,
            },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          studentId: user.studentId,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // For Google OAuth, verify it's a Binus email
      if (account?.provider === "google") {
        const email = user.email || "";
        if (!email.endsWith("@binus.ac.id")) {
          return false; // Reject non-Binus emails
        }

        // Extract student ID from email (e.g., 2501234567@binus.ac.id)
        const studentId = email.split("@")[0];

        // Check if user exists, if not create
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email,
              studentId,
              name: user.name || `Student ${studentId}`,
              faculty: "Unknown", // Can be updated later
              major: "Unknown",
              year: 1,
            },
          });

          // Create user stats
          await prisma.userStats.create({
            data: {
              userId: user.id,
            },
          });
        }
      }

      return true;
    },
    async session({ session, token, user }) {
      // Add custom fields to session
      if (session.user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email || "" },
        });

        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.studentId = dbUser.studentId;
          session.user.faculty = dbUser.faculty;
          session.user.major = dbUser.major;
        }
      }

      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.studentId = (user as any).studentId;
      }
      return token;
    },
  },
  pages: {
    signIn: "/", // Custom sign-in page (landing page)
    error: "/", // Error page
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Export NextAuth instance
export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);

// For backward compatibility with existing code
export const authOptions = authConfig;
