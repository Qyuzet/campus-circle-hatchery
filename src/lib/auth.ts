// NextAuth Configuration for CampusCircle
import NextAuth, { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";

export const authConfig: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // For Google OAuth, create user if doesn't exist
      if (account?.provider === "google") {
        const email = user.email || "";

        // Generate student ID from email or use a default pattern
        const studentId = email.split("@")[0];

        // Check if user exists, if not create
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (!existingUser) {
          const newUser = await prisma.user.create({
            data: {
              email,
              studentId,
              name: user.name || `User ${studentId}`,
              faculty: "Unknown",
              major: "Unknown",
              year: 1,
              avatarUrl: user.image || null,
            },
          });

          // Create user stats
          await prisma.userStats.create({
            data: {
              userId: newUser.id,
            },
          });
        } else if (user.image && existingUser.avatarUrl !== user.image) {
          // Update avatar URL if it changed
          await prisma.user.update({
            where: { email },
            data: { avatarUrl: user.image },
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
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Export NextAuth instance
export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);

// For backward compatibility with existing code
export const authOptions = authConfig;
