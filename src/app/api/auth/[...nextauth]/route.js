import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { autenticarUsuario } from "../../../../../services/authService";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        try {
          const user = await autenticarUsuario(credentials);

          if (!user || !user.token) {
            throw new Error("Credenciales incorrectas.");
          }

          return user; // 🔹 Devuelve el usuario con el token generado
        } catch (error) {
          console.error("❌ Error en autorización:", error);
          throw new Error(error.message || "Error en la autenticación.");
        }
      },
    }),
  ],
  pages: {
    signIn: "/login", // 🔹 Página de inicio de sesión personalizada
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.name;
        token.role = user.role;
        token.token = user.token;
        token.expiresAt = user.expiresAt;
      }

      // 🔹 Si el token ha expirado, invalidar sesión
      if (Date.now() > token.expiresAt) {
        console.log("🔄 Token expirado. Cerrando sesión automáticamente.");
        return null;
      }

      return token;
    },
    async session({ session, token }) {
      if (!token) {
        console.log("❌ Token expirado. Sesión inválida.");
        return null;
      }

      session.user.id = token.id;
      session.user.username = token.username;
      session.user.role = token.role;
      session.user.token = token.token;

      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 3600, // ⏳ Expira en 1 hora
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
