import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          console.log("Authorize: Tidak ada credentials.");
          return null;
        }

        console.log("Authorize: Mencoba menghubungkan ke DB...");
        await connectDB();
        console.log("Authorize: Terhubung ke DB.");

        try {
          console.log("Authorize: Mencari user dengan email:", credentials.email);
          const user = await User.findOne({ email: credentials.email });

          if (!user) {
            console.log("Authorize: User tidak ditemukan.");
            return null;
          }
          console.log("Authorize: User ditemukan:", user.email);

          console.log("Authorize: Membandingkan password...");
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordCorrect) {
            console.log("Authorize: Password tidak cocok.");
            return null;
          }

          console.log("Authorize: Password cocok! Mengembalikan data user.");
          return { id: user._id.toString(), email: user.email, name: user.fullName, role: user.role };

        } catch (error) {
          console.error("Authorize: Terjadi error saat otorisasi:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
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
    error: "/api/auth/error", // Arahkan ke halaman error default jika ada masalah
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };