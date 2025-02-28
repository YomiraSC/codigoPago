import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { autenticarUsuario } from "../../../../../services/authService";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        /* try {
          const user = await autenticarUsuario(credentials);

          if (!user || !user.token) {
            throw new Error("Credenciales incorrectas.");
          }

          return user; // 🔹 Devuelve el usuario con el token generado
        } catch (error) {
          console.error("❌ Error en autorización:", error);
          throw new Error(error.message || "Error en la autenticación.");
        } */
          try {
            console.log("🔍 Autenticando usuario:", credentials.username);
  
            // 🔹 Buscar usuario en MySQL
            const usuario = await prisma.usuario.findUnique({
              where: { username: credentials.username },
              include: { rol: true },
            });
  
            if (!usuario) throw new Error("Usuario no encontrado.");
  
            // 🔑 Validar contraseña (Si aún no está encriptada, usa comparación simple)
            //const esPasswordCorrecto = await bcrypt.compare(credentials.password, usuario.password);
            //const esPasswordCorrecto = credentials.password === usuario.password;
            const esPasswordCorrecto = await bcrypt.compare(credentials.password, usuario.password);
            const esPasswordCorrecto2 = credentials.password === usuario.password;
  
            if (!esPasswordCorrecto && !esPasswordCorrecto2) throw new Error("Contraseña incorrecta.");

            //if (!esPasswordCorrecto) throw new Error("Contraseña incorrecta.");
  
            return {
              id: usuario.usuario_id,
              name: usuario.username,
              email: usuario.email,
              role: usuario.rol.nombre_rol, // 🔹 Se obtiene el rol del backend
              tokenExpires: Date.now() + 3600 * 1000, // 🔹 Expiración en 1 hora
            };
          } catch (error) {
            console.error("❌ Error en autenticación:", error.message);
            throw new Error(error.message);
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
