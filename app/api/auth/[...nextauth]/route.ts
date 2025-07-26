// app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        await connectDB();
        
        const user = await User.findOne({ email: credentials.email });
        if (!user) return null;

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isPasswordCorrect) return null;
        
        // Return user object agar bisa diakses di callbacks
        return { id: user._id.toString(), email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  
  // --- BAGIAN PENTING ADA DI SINI ---
  callbacks: {
    async jwt({ token, user }) {
      // Saat user login pertama kali, object 'user' dari authorize akan tersedia
      if (user) {
        token.role = user.role; // Tambahkan field 'role' dari database ke token
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Tambahkan field 'role' dari token ke object 'session'
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };