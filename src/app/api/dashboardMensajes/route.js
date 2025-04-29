// src/app/api/dashboard/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const total = await prisma.campanha_temporal.count();

    const enviados = await prisma.campanha_temporal.count({
      where: {
        estado_envio: {
          in: ["delivered"] // puedes ajustar esto según tu definición de "enviado"
        }
      }
    });

    const leidos = await prisma.campanha_temporal.count({
      where: {
        estado_envio: "read"
      }
    });

    const fallidos = await prisma.campanha_temporal.count({
      where: {
        estado_envio: {
            in: ["failed", "undelivered"] // puedes ajustar esto según tu definición de "enviado"
          }
      }
    });

    return NextResponse.json({
      total,
      enviados,
      leidos,
      fallidos,
      porcentajeEnviados: total ? (enviados / total) * 100 : 0,
      porcentajeLeidos: total ? (leidos / total) * 100 : 0,
      porcentajeFallidos: total ? (fallidos / total) * 100 : 0
    });
  } catch (error) {
    console.error("Error en el dashboard API:", error);
    return NextResponse.json({ error: "Error al obtener datos del dashboard" }, { status: 500 });
  }
}
