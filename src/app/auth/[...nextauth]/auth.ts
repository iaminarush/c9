import { NextAuthOptions } from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "~/server/db/db";
import CredentialsProvider from "next-auth/providers/credentials";
import { users } from "~/server/db/schema/account";

export const authOptions: NextAuthOptions = {
  callbacks: {
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        // session.user.role = user.role; <-- put other properties on the session here
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  adapter: DrizzleAdapter(db),
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
        const user = await db
          .selectDistinctOn([users.id], { name: users.name })
          .from(users);
        // const user = await prisma.user.findUnique({
        //   where: {
        //     username,
        //   },
        // });

        if (!user) throw new Error("Incorrect credentials. Try again");

        // if (!user) {
        //   const createdUser = await prisma.user.create({
        //     data: {
        //       username,
        //       password: await hash(password, 12), //eslint-disable-line
        //     },
        //   });

        //   return createdUser;
        // }

        // eslint-disable-next-line
        const match = await compare(password, user.password);

        if (!match) throw new Error("Incorrect credentials. Try again");
        console.log(user);

        return user;
      },
    }),
  ],
};
