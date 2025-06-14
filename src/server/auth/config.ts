import { type DefaultSession, type NextAuthConfig } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import type { Provider } from "next-auth/providers";
import type { DiscordProfile } from "next-auth/providers/discord";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

export function getDiscordImage(profile: DiscordProfile): string {
  const baseUrl = "https://cdn.discordapp.com/avatars";
  const isAnimated = profile.avatar?.startsWith("a_");
  const format = isAnimated ? "gif" : "png";
  return `${baseUrl}/${profile.id}/${profile.avatar}.${format}`;
}

const providers: Provider[] = [
  DiscordProvider({
    profile(profile: DiscordProfile) {
      return {
        id: profile.id,
        name: profile.username,
        email: profile.email,
        image: getDiscordImage(profile),
      };
    },
  }),
  /**
   * ...add more providers here.
   *
   * Most other providers require a bit more work than the Discord provider. For example, the
   * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
   * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
   *
   * @see https://next-auth.js.org/providers/github
   */
];

export const providerMap = providers
  .map((provider) => {
    if (typeof provider === "function") {
      const providerData = provider();
      return { id: providerData.id, name: providerData.name };
    } else {
      return { id: provider.id, name: provider.name };
    }
  })
  .filter((provider) => provider.id !== "credentials");

export default {
  providers: providers,
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;
