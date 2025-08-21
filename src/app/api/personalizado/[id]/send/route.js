// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
// import twilio from "twilio";
// import admin from "firebase-admin";
// // al inicio del archivo
// function formatPhone(raw) {
//   // 1) quitar todo lo que no sea dígito
//   let digits = raw.replace(/\D/g, "");
//   // 2) si son 9 dígitos (e.g. 987654321), asumimos +51
//   if (digits.length === 9) {
//     digits = "51" + digits;
//   }
//   // 3) devolvemos en el formato que espera Twilio
//   return `whatsapp:+${digits}`;
// }
// const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CREDENTIALS)),
//   });
// }
// const db = admin.firestore();

// export async function POST(req, { params }) {
//     const { id } = await params;
//     const temporalId = Number(id);
//     if (isNaN(temporalId)) {
//         return NextResponse.json({ error: "ID no válido" }, { status: 400 });
//     }

//   // traer registro + campaña + template
//   const registro = await prisma.campanha_temporal.findUnique({
//     where: { id: temporalId },
//     include: {
//       campanha: { include: { template: true } },
//     },
//   });
//   if (!registro)
//     return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });

//   const { celular, campanha, campanha: { template } } = registro;
//   const to = formatPhone(registro.celular);
//   const from = `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`;
//   const payload = { from, to, contentSid: template.template_content_sid };

//   // si template requiere variables:
//   if (template.parametro) {
//     payload.contentVariables = JSON.stringify({ 1: celular });
//   }

//   try {
//     const msg = await client.messages.create(payload);
//     const rawStatus = msg.status;
//     const mappedStatus = rawStatus === "queued" ? "enviado" : rawStatus;
//     // actualizar estado en Prisma
//     await prisma.campanha_temporal.update({
//       where: { id: temporalId },
//       data: {
//         twilio_sid: msg.sid,
//         estado_envio: mappedStatus,
//       },
//     });

//     // opcional: guardar en Firestore
//     await db.collection("test").add({
//       celular,
//       fecha: new Date(),
//       id_bot: "codigopago",
//       mensaje: template.mensaje,
//       sender: false,
//     });

//     return NextResponse.json({ status: "sent", sid: msg.sid });
//   } catch (err) {
//     await prisma.campanha_temporal.update({
//       where: { id: temporalId },
//       data: {
//         estado_envio: "failed",
//         error_codigo: err.code?.toString(),
//         error_mensaje: err.message,
//       },
//     });
//     return NextResponse.json({ status: "failed", error: err.message }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import twilio from "twilio";
// import admin from "firebase-admin";
import { db } from "@/lib/firebaseAdmin";

// helper para normalizar teléfono
function formatPhone(raw) {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 9) digits = "51" + digits;
  return `whatsapp:+${digits}`;
}

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

export async function POST(req, { params }) {
  // 1) resolver params
  const { id } = await params;
  const temporalId = Number(id);
  if (isNaN(temporalId)) {
    return NextResponse.json({ error: "ID no válido" }, { status: 400 });
  }

  // 2) inicializar Firebase **solo en runtime** si hace falta
  // if (!admin.apps.length) {
  //   if (process.env.FIREBASE_CREDENTIALS) {
  //     const svc = JSON.parse(process.env.FIREBASE_CREDENTIALS);
  //     admin.initializeApp({
  //       credential: admin.credential.cert(svc),
  //     });
  //   } else {
  //     console.warn("⚠️ FIREBASE_CREDENTIALS no definido, omito Firestore");
  //   }
  // }
  // const db = admin.apps.length ? admin.firestore() : null;
  

  // 3) recuperar registro + campaña + template
  const registro = await prisma.campanha_temporal.findUnique({
    where: { id: temporalId },
    include: { campanha: { include: { template: true } } },
  });
  if (!registro) {
    return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
  }

  const {
    celular,
    campanha: { template },
  } = registro;

  // 4) preparar payload Twilio
  const to = formatPhone(celular);
  const from = `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`;
  const payload = {
    from,
    to,
    contentSid: template.template_content_sid,
  };
  if (template.parametro) {
    payload.contentVariables = JSON.stringify({ 1: celular });
  }

  // 5) enviar y actualizar estado
  try {
    const msg = await client.messages.create(payload);
    const estado = msg.status === "queued" ? "enviado" : msg.status;

    await prisma.campanha_temporal.update({
      where: { id: temporalId },
      data: {
        twilio_sid: msg.sid,
        estado_envio: estado,
      },
    });

    // 6) opcional: guardar en Firestore si lo inicializaste
    if (db) {
      await db.collection("test").add({
        celular,
        fecha: new Date(),
        id_bot: "codigopago",
        mensaje: template.mensaje,
        sender: false,
      });
    }

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
