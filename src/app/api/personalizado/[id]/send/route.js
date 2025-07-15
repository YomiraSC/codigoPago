import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import twilio from "twilio";
import admin from "firebase-admin";
// al inicio del archivo
function formatPhone(raw) {
  // 1) quitar todo lo que no sea dígito
  let digits = raw.replace(/\D/g, "");
  // 2) si son 9 dígitos (e.g. 987654321), asumimos +51
  if (digits.length === 9) {
    digits = "51" + digits;
  }
  // 3) devolvemos en el formato que espera Twilio
  return `whatsapp:+${digits}`;
}
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CREDENTIALS)),
  });
}
const db = admin.firestore();

export async function POST(req, { params }) {
    const { id } = await params;
    const temporalId = Number(id);
    if (isNaN(temporalId)) {
        return NextResponse.json({ error: "ID no válido" }, { status: 400 });
    }

  // traer registro + campaña + template
  const registro = await prisma.campanha_temporal.findUnique({
    where: { id: temporalId },
    include: {
      campanha: { include: { template: true } },
    },
  });
  if (!registro)
    return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });

  const { celular, campanha, campanha: { template } } = registro;
  const to = formatPhone(registro.celular);
  const from = `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`;
  const payload = { from, to, contentSid: template.template_content_sid };

  // si template requiere variables:
  if (template.parametro) {
    payload.contentVariables = JSON.stringify({ 1: celular });
  }

  try {
    const msg = await client.messages.create(payload);
    const rawStatus = msg.status;
    const mappedStatus = rawStatus === "queued" ? "enviado" : rawStatus;
    // actualizar estado en Prisma
    await prisma.campanha_temporal.update({
      where: { id: temporalId },
      data: {
        twilio_sid: msg.sid,
        estado_envio: mappedStatus,
      },
    });

    // opcional: guardar en Firestore
    await db.collection("test").add({
      celular,
      fecha: new Date(),
      id_bot: "codigopago",
      mensaje: template.mensaje,
      sender: false,
    });

    return NextResponse.json({ status: "sent", sid: msg.sid });
  } catch (err) {
    await prisma.campanha_temporal.update({
      where: { id: temporalId },
      data: {
        estado_envio: "failed",
        error_codigo: err.code?.toString(),
        error_mensaje: err.message,
      },
    });
    return NextResponse.json({ status: "failed", error: err.message }, { status: 500 });
  }
}
