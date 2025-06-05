import NextAuth from "next-auth";
import { cache } from "react";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import type { DiscordProfile } from "next-auth/providers/discord";

import { db } from "~/server/db";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "~/server/db/schema";
import { eq } from "drizzle-orm";

import authConfig, { getDiscordImage } from "./config";

const {
  auth: uncachedAuth,
  handlers,
  signIn,
  signOut,
} = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, profile }) {
      if (profile?.avatar && typeof user.id === "string") {
        const image = getDiscordImage(profile as DiscordProfile);
        if (user.image !== image) {
          await db
            .update(users)
            .set({ image: image })
            .where(eq(users.id, user.id));
        }
      }
      return true;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: typeof token.id === "string" ? token.id : undefined,
        image: typeof token.image === "string" ? token.image : undefined,
      },
    }),
    authorized: async ({ auth }) => {
      return !!auth;
    },
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.image = user.image;
      }
      return token;
    },
  },
  ...authConfig,
});

const auth = cache(uncachedAuth);

export { auth, handlers, signIn, signOut };
