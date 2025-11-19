/**
 * NextAuth API Route with Supabase Adapter
 */

import NextAuth, { type NextAuthOptions } from "next-auth";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import type { Adapter } from "next-auth/adapters";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }) as Adapter,
  callbacks: {
    async session({ session, token }: any) {
      if (token) {
        session.accessToken = token.supabaseAccessToken;
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user, account }: any) {
      if (account && user) {
        token.supabaseAccessToken = account.access_token;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/api/auth/signin",
    error: "/api/auth/error",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

