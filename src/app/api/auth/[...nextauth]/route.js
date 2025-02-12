import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

        const res = await fetch(`${API_URL}/login`, {
          method: "POST",
          body: JSON.stringify(credentials),
          headers: { "Content-Type": "application/json" },
        });

        const user = await res.json();
        console.log("Usuario devuelto por Flask:", user);

        if (res.ok && user.token) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: user.token,
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.token = user.token;
      }
      console.log("Token en JWT:", token);
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.token = token.token;
      console.log("Sesión en NextAuth:", session);
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
