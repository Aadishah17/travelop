import type { NextAuthOptions, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

const credentialsSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8),
});

type TraveloopJWT = JWT & {
  id?: string;
};

type TraveloopSession = Session & {
  user: NonNullable<Session["user"]> & {
    id: string;
  };
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    newUser: "/dashboard",
  },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });

        if (!user?.passwordHash || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }): Promise<TraveloopJWT> {
      if (user) {
        token.id = user.id;
      }

      return token;
    },
    async session({ session, token }): Promise<TraveloopSession> {
      return {
        ...session,
        user: {
          ...session.user,
          id: String(token.id),
        },
      };
    },
  },
};

export function getAuthSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return null;
  }

  return session.user;
}

export async function requireAuthSession() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return null;
  }

  return session as TraveloopSession;
}

export async function requireUserId() {
  const session = await requireAuthSession();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  return userId;
}
