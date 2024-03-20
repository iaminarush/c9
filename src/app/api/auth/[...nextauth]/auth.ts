import { db } from "@/server/db/db";
import { users } from "@/server/db/schema/accounts";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { DefaultSession, NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { compare } from "bcrypt";
import { eq } from "drizzle-orm";
import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import { DefaultJWT } from "next-auth/jwt";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      admin: boolean;
      username: string;
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends Record<string, unknown>, DefaultJWT {
    sub: string;
    admin: boolean;
    username: string;
  }
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        // eslint-disable-next-line
        // @ts-ignore
        return { ...token, admin: user.admin, username: user.username };
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.admin = token.admin;
        session.user.username = token.username;
        session.user.id = token.sub;
        // session.user.id = token.sub;
        // session.user.role = user.role; <-- put other properties on the session here
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  adapter: DrizzleAdapter(db),
  // pages: {
  //   signIn: "/auth/signin",
  //   signOut: "/auth/signout",
  //   error: "/auth/error",
  //   verifyRequest: "/auth/verify-request",
  // },
  providers: [
    // DiscordProvider({
    //   clientId: env.DISCORD_CLIENT_ID,
    //   clientSecret: env.DISCORD_CLIENT_SECRET,
    // }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials)
          throw new Error("Please enter credentials and try again");

        const { username, password } = credentials;
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.username, username))
          .limit(1);

        if (!user) throw new Error("Incorrect credentials. Try again");

        // if (!user) {
        //   const passwordHash = await hash(password, 12);
        //   const [createdUser] = await db
        //     .insert(users)
        //     .values({
        //       username: username,
        //       password: await hash(password, 12),
        //     })
        //     .returning();

        //   if (createdUser) return createdUser;
        //   else return null;
        // }

        const match = await compare(password, user.password);

        if (!match) throw new Error("Incorrect credentials. Try again");

        // const { password: pw, ...rest } = user;

        return {
          admin: user.admin,
          username: user.username,
          id: user.id,
          image: user.image,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
};

export function auth(
  ...args:
    | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, authOptions);
}
