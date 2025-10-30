import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

/**
 * Hook personalizado para manejar autenticación y roles.
 */
export function useAuth() {
  const { data: session, status } = useSession();

  // useEffect(() => {
  //   if (session?.user?.token) {
  //     const tokenExp = JSON.parse(atob(session.user.token.split(".")[1])).exp * 1000;
  //     const currentTime = Date.now();

  //     if (currentTime >= tokenExp) {
  //       console.log("🔄 Token expirado. Cerrando sesión.");
  //       signOut(); // 🔹 Cierra sesión automáticamente
  //     }
  //   }
  // }, [session]);

  return {
    isAuthenticated: status === "authenticated",
    userRole: session?.user?.role || "guest",
    loading: status === "loading",
  };
}
