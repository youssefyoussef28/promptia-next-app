import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import { signIn } from "next-auth/react";
import { connectToDB } from "@utils/database";
import User from "@models/user";

// console.log({
//   clientId: process.env.GOOGLE_ID,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
// });

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  async session({ session }) {
    const sessionUser = await User.findOne({
      email: session.user.email,
    });

    // Updating the ID
    session.user.id = sessionUser._id.toString();
    return session;
  },

  async signIn({ profile }) {
    try {
      await connectToDB();

      // Check if a user exists
      const userExists = await User.findOne({ email: profile.email });
      // if not , create a new user
      if (!userExists) {
        await User.create({
          email: profile.email,
          username: profile.name.replace(" ", "").toLowerCase(),
          image: profile.picture,
        });
      }
    } catch (error) {}
  },
});

export { handler as GET, handler as POST };
