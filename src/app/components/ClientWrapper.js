"use client"; // Este archivo debe ser un componente cliente

import { usePathname } from "next/navigation";
import Layout from "./Layout";
import { SessionProvider } from "next-auth/react";

export default function ClientWrapper({ children }) {
  const pathname = usePathname();
  const excludedRoutes = ["/login", "/register"]; // Rutas donde no se aplicará el Layout

  // Verifica si la ruta actual está en las rutas excluidas
  const isExcluded = excludedRoutes.includes(pathname);

  return isExcluded ? children : <SessionProvider><Layout>{children}</Layout></SessionProvider>;
}