import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Rutas protegidas
  const protectedRoutes = ["/dashboard", "/settings"]; // Agrega aquí todas las rutas protegidas

  // Si no hay token y el usuario intenta acceder a una ruta protegida, redirige al login
  if (!token && protectedRoutes.some((path) => req.nextUrl.pathname.startsWith(path))) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Deja pasar el resto de las solicitudes
  return NextResponse.next();
}