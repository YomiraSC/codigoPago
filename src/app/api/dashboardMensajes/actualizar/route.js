// src/app/api/dashboard/actualizar/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import twilio from "twilio";
import pLimit from "p-limit";

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const limit = pLimit(100); // hasta 100 llamadas a Twilio en paralelo

export async function GET() {
  try {
    const mensajes = await prisma.campanha_temporal.findMany({
      where: {
        twilio_sid: { not: null },
        estado_envio: {
          in: ["queued", "accepted", "sending", "sent", "delivered"], // solo los que pueden cambiar
        },
      },
      select: {
        id: true,
        twilio_sid: true,
      },
    });

    const actualizaciones = mensajes.map((msg) =>
      limit(async () => {
        try {
          const twilioMsg = await client.messages(msg.twilio_sid).fetch();
          await prisma.campanha_temporal.update({
            where: { id: msg.id },
            data: {
              estado_envio: twilioMsg.status,
              error_codigo: twilioMsg.errorCode?.toString() || null,
              error_mensaje: twilioMsg.errorMessage || null,
            },
          });
          return { id: msg.id, status: twilioMsg.status };
        } catch (error) {
          console.error(`❌ Error con ${msg.twilio_sid}:`, error.message);
          return { id: msg.id, status: "error", error: error.message };
        }
      })
    );

    const resultados = await Promise.allSettled(actualizaciones);

    return NextResponse.json({
      success: true,
      actualizados: resultados.length,
      mensaje: "Estados actualizados desde Twilio",
    });
  } catch (error) {
    console.error("Error en actualización Twilio:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
