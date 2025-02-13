"use client";
import { usePathname } from "next/navigation";
import Layout from "./Layout";
import { SessionProvider } from "next-auth/react";
import { useAuth } from "../../hooks/useAuth";

export default function ClientWrapper({ children }) {
  const pathname = usePathname();
  const excludedRoutes = ["/login", "/register"]; // Rutas sin layout
  const isExcluded = excludedRoutes.includes(pathname);

  return (
    <SessionProvider>
      <AuthWrapper>
        {isExcluded ? children : <Layout>{children}</Layout>}
      </AuthWrapper>
    </SessionProvider>
  );
}

function AuthWrapper({ children }) {
  useAuth();
  return children;
}