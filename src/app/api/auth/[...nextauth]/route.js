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
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

          const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            body: JSON.stringify(credentials),
            headers: { "Content-Type": "application/json" },
          });

          const user = await res.json();
          console.log("Usuario devuelto por Flask:", user);

          if (!res.ok || !user.token) {
            throw new Error(user.message || "Credenciales incorrectas");
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role, // 🔹 Se obtiene el rol del backend
            token: user.token,
            expiresAt: Date.now() + user.expiresIn * 1000, // 🔹 Calculamos la expiración
          };
        } catch (error) {
          console.error("Error en la autenticación:", error);
          throw new Error("Error en la autenticación");
        }
      },
    }),
  ],
  pages: {
    signIn: "/login", // 🔹 Redirige a esta página cuando el usuario no está autenticado
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.token = user.token;
        token.expiresAt = user.expiresAt; // 🔹 Guardamos la expiración del token
      }

      // 🔹 Si el token ha expirado, cerrar sesión forzosamente
      if (Date.now() > token.expiresAt) {
        console.log("🔄 Token expirado. Forzando cierre de sesión.");
        return null; // 🔹 Devolver `null` para invalidar la sesión
      }

      console.log("Token en JWT:", token);
      return token;
    },
    async session({ session, token }) {
      if (!token) {
        console.log("❌ Token expirado o inválido. Cerrando sesión.");
        return null; // 🔹 Invalidar sesión
      }

      session.user.role = token.role;
      session.user.token = token.token;

      console.log("Sesión en NextAuth:", session);
      return session;
    },
  },
  session: {
    strategy: "jwt", // 🔹 Usamos JWT en lugar de base de datos para manejar sesiones
  },
  secret: process.env.NEXTAUTH_SECRET, // 🔹 Clave secreta para cifrar sesiones
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
