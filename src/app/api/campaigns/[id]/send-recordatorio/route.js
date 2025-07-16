import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import admin from "firebase-admin";
import twilio from "twilio";

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CREDENTIALS)) });
}
const db = admin.firestore();

export async function POST(req, { params }) {
  const campanhaId = Number(params.id);
  if (isNaN(campanhaId)) {
    return NextResponse.json({ error: "ID de campaña no válido" }, { status: 400 });
  }

  // 1) Carga la campaña y su template
  const campaign = await prisma.campanha.findUnique({
    where: { campanha_id: campanhaId },
    include: { template: true }
  });
  if (!campaign?.template?.template_content_sid) {
    return NextResponse.json({ error: "Template inválido" }, { status: 400 });
  }

  // 2) Obtén todos los clientes que NO han pagado
  const clientes = await prisma.cliente.findMany({
    where: { pago_realizado: false }
  });
  if (clientes.length === 0) {
    return NextResponse.json({ error: "No hay clientes pendientes de pago" }, { status: 400 });
  }

  const whatsappFrom = `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`;
  const sendPromises = clientes.map(c => {
    const to = `whatsapp:${c.celular.trim()}`;
    const payload = {
      from: whatsappFrom,
      to,
      contentSid: campaign.template.template_content_sid,
      contentVariables: campaign.template.parametro
        ? JSON.stringify({ 1: "MAQUI+" })
        : undefined
    };
    return client.messages.create(payload)
      .then(msg => {
        // opcional: actualiza en BD o Firestore
        return { to: c.celular, status: "sent", sid: msg.sid };
      })
      .catch(err => ({ to: c.celular, status: "failed", error: err.message }));
  });

  const results = await Promise.allSettled(sendPromises);
  const sentMessages = results.map(r => r.status === "fulfilled" ? r.value : { status: "error", error: r.reason });
  return NextResponse.json({ success: true, sentMessages });
}
