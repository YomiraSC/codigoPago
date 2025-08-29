import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import db from "@/lib/firebase";

// Extrae placeholders en orden de aparición: {{nombre}}, {{codigo}} o {{1}}
function extractPlaceholders(str) {
  const re = /\{\{\s*(nombre|codigo|\d+)\s*\}\}/gi;
  const out = [];
  let m;
  while ((m = re.exec(str)) !== null) out.push(m[1].toLowerCase());
  return out;
}

// Construye el arreglo Meta "components[0].parameters" según placeholders
function buildMetaParameters(placeholders, ctx) {
  // ctx: { nombre, codigo }
  // Meta espera objetos { type: "text", text: "..." } en el mismo orden que el template
  const params = [];
  for (const ph of placeholders) {
    let val = "";
    if (ph === "nombre") val = ctx.nombre || "";
    else if (ph === "codigo" || /^\d+$/.test(ph)) val = ctx.codigo || "";
    else val = "";
    params.push({ type: "text", text: String(val) });
  }
  // Si no se detectó placeholder, enviamos solo el código por compatibilidad
  if (params.length === 0 && ctx.codigo) {
    params.push({ type: "text", text: String(ctx.codigo) });
  }
  return params;
}
function normalizeTo(msisdn) {
  if (!msisdn) return "";
  let digits = String(msisdn).replace(/\D/g, "");
  // quita prefijo 00
  if (digits.startsWith("00")) digits = digits.slice(2);
  // Perú: si viene con 9 dígitos (móvil), anteponer 51
  if (digits.length === 9) digits = "51" + digits;
  // Si ya viene 11 con 51, lo dejas igual
  // Si viniera con +, arriba ya lo quitamos
  return digits;
}

export async function POST(request) {
  try {
    const {
      cliente_id,
      estado,
      nota,
      fecha_promesa_pago,
      accion,
      gestor,
      plantilla_id,
      variables,           // { codigo }
      cliente_contacto     // { nombre, celular }  -> celular: 51XXXXXXXXX (sin +)
    } = await request.json();
    console.log('📩 Datos recibidos en /api/accion_comercial:', {
      cliente_id,
      estado,
      nota,
      fecha_promesa_pago,
      accion,
      gestor,
      plantilla_id,
      variables,
      cliente_contacto
    });
    if (!gestor) return NextResponse.json({ error: "Falta gestor_username" }, { status: 400 });
    if (!accion) return NextResponse.json({ error: "Falta acción comercial" }, { status: 400 });

    // 0) Resolver persona_id del gestor a partir del username
    const user = await prisma.usuario.findUnique({
      where: { username: gestor },
      select: { usuario_id: true },
    });
    if (!user) {
      return NextResponse.json({ error: `No existe usuario con username ${gestor}` }, { status: 404 });
    }
    const personaIdGestor = user.usuario_id;

    // 0.1) Actualizar gestor en cliente
    if (cliente_id != null && cliente_id !== "" && !Number.isNaN(Number(cliente_id))) {
      await prisma.cliente.update({
        where: { cliente_id: Number(cliente_id) },
        data: { gestor: gestor, accion: accion }
      });
    }


    // 1) Si es Promesa de pago, registrar cita y acción comercial, NO WhatsApp
    if (accion === "Promesa de pago" && fecha_promesa_pago) {
      // Registrar promesa/cita
      await prisma.cita.create({
        data: {
          cliente_id: Number(cliente_id),
          fecha_cita: new Date(fecha_promesa_pago),
          estado_cita: "Promesa de Pago",
          motivo: "Promesa de Pago registrada",
          fecha_creacion: new Date(),
        },
      });
      // Registrar acción comercial
      const accionCom = await prisma.accion_comercial.create({
        data: {
          cliente_id: Number(cliente_id),
          estado: accion,
          fecha_accion: new Date(),
          nota: nota || "Promesa de pago registrada",
          gestor: gestor,
        },
      });
      return NextResponse.json({
        success: true,
        message: "Promesa de pago registrada",
        accion_comercial: accionCom
      });
    }

    // 2) Si es Codigo entregado, registrar acción comercial y enviar WhatsApp
    if (accion === "Codigo entregado") {
      if (!plantilla_id)    return NextResponse.json({ error: "Falta plantilla_id" }, { status: 400 });
      if (!variables?.codigo) return NextResponse.json({ error: "Falta variables.codigo" }, { status: 400 });
      if (!cliente_contacto?.nombre || !cliente_contacto?.celular)
        return NextResponse.json({ error: "Faltan datos de cliente_contacto" }, { status: 400 });

      // Registrar acción comercial
      const accionCom = await prisma.accion_comercial.create({
        data: {
          cliente_id: Number(cliente_id),
          estado: accion,
          fecha_accion: new Date(),
          nota: nota || " ",
          gestor: gestor,
        },
      });

      // Cargar plantilla
      const plantilla = await prisma.template.findUnique({
        where: { id: parseInt(plantilla_id) },
        select: { id: true, nombre_template: true, mensaje: true }
      });
      if (!plantilla) return NextResponse.json({ error: "Plantilla no encontrada" }, { status: 404 });

      // Preparar parámetros dinámicos de acuerdo al mensaje
      const placeholders = extractPlaceholders(plantilla.mensaje || "");
      const parameters = buildMetaParameters(placeholders, {
        nombre: cliente_contacto.nombre,
        codigo: variables.codigo
      });

      // Llamar a Meta API (ajusta el número si usas +51 delante)
      const metaBody = {
        messaging_product: "whatsapp",
        to: cliente_contacto.celular,
        type: "template",
        template: {
          name: plantilla.nombre_template,
          language: { code: "es_PE" },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: variables.codigo
                }
              ]
            }
          ]
        }
      };
      console.log('🚀 Enviando a Meta API:', JSON.stringify(metaBody, null, 2));
      const metaResp = await fetch('https://graph.facebook.com/v18.0/710553965483257/messages', {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${process.env.META_ACCESS_TOKEN}`,
          'Content-Type': "application/json",
        },
        body: JSON.stringify(metaBody),
      });

      const metaJson = await metaResp.json();
      console.log('📱 Respuesta de Meta API:', metaJson);
      if (!metaResp.ok) {
        console.error("Meta API error:", metaJson);
        return NextResponse.json({
          success: false,
          warning: "Acción registrada pero fallo envío de mensaje",
          meta_error: metaJson,
          accion_comercial: accionCom
        }, { status: 207 });
      }

// ================================
     // 🔥 Guardar en Firestore (solo éxito)
      try {
        console.log("🔥 [FIREBASE] Guardando mensaje en Firestore");
        const wamid  = metaJson?.messages?.[0]?.id || null;
        const status = metaJson?.messages?.[0]?.message_status || "accepted";

        // Número normalizado (solo dígitos)
        const to = String(cliente_contacto.celular).replace(/\D/g, "");

        // Construye el mensaje final como fue mostrado en la vista previa
        const nombre = (cliente_contacto?.nombre || "").trim();
        const codigo = (variables?.codigo || "").trim();
        let   mensajeFinal = String(plantilla.mensaje || "");
        mensajeFinal = mensajeFinal.replace(/\{\{\s*nombre\s*\}\}/gi, nombre || "[NOMBRE]");
        mensajeFinal = mensajeFinal.replace(/\{\{\s*codigo\s*\}\}/gi, codigo || "[CÓDIGO]");
        // Compatibilidad con templates numerados (asumimos {{1}} = código)
        mensajeFinal = mensajeFinal.replace(/\{\{\s*1\s*\}\}/g, codigo || "[CÓDIGO]");

        const firebaseDoc = {
          celular: to,
          fecha: new Date(), // Firestore lo guarda como Timestamp
          id_bot: "codigopago",
          id_cliente: Number(cliente_id) || null,
          mensaje: mensajeFinal,
          template_name: plantilla.nombre_template,
          sender: "false",             // saliente
          message_id: wamid,
          estado: status,              // 'accepted' (entrega final llega por webhook)
          gestor,
          accion
        };

        await db
          .collection("test")
          .doc(to)                     // si prefieres histórico, usa .doc(`${to}_${wamid}`)
          .set(firebaseDoc, { merge: true });

        console.log("✅ [FIREBASE] Mensaje guardado en Firestore");
      } catch (e) {
        console.error("🔥 [FIREBASE] Error guardando mensaje:", e);
        // No interrumpimos el flujo de éxito si falla Firestore
      }

      return NextResponse.json({
        success: true,
        message: "Acción comercial registrada y mensaje enviado",
        meta_message_id: metaJson?.messages?.[0]?.id || null,
        accion_comercial: accionCom
      });
    }

    // Si no es ninguna de las dos, solo registrar acción comercial genérica
    const accionCom = await prisma.accion_comercial.create({
      data: {
        cliente_id: Number(cliente_id),
        estado: accion,
        fecha_accion: new Date(),
        nota: nota || "Acción comercial registrada",
        gestor: gestor,
      },
    });
    return NextResponse.json({
      success: true,
      message: "Acción comercial registrada",
      accion_comercial: accionCom
    });
    // 1) Registrar acción comercial
    // const accionCom = await prisma.accion_comercial.create({
    //   data: {
    //     cliente_id: cliente_id ?? null,
    //     estado: estado || "",
    //     nota: nota || "",
    //     fecha_accion: new Date(),
    //     gestor: gestor_username
    //   }
    // });

    // 2) Cargar plantilla
    const plantilla = await prisma.template.findUnique({
      where: { id: parseInt(plantilla_id) },
      select: { id: true, nombre_template: true, mensaje: true }
    });
    if (!plantilla) return NextResponse.json({ error: "Plantilla no encontrada" }, { status: 404 });

    // 3) Preparar parámetros dinámicos de acuerdo al mensaje
    const placeholders = extractPlaceholders(plantilla.mensaje || "");
    const parameters = buildMetaParameters(placeholders, {
      nombre: cliente_contacto.nombre,
      codigo: variables.codigo
    });

    // 4) Llamar a Meta API (ajusta el número si usas +51 delante)
    const metaBody = {
      messaging_product: "whatsapp",
      to: cliente_contacto.celular, // ej: "51987654321" o "+51987654321" según tu cuenta
      type: "template",
      template: {
        name: plantilla.nombre_template,
        language: { code: "es_PE" },
        components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: variables.codigo
                }
              ]
            }
          ]
      }
    };
    console.log('🚀 Enviando a Meta API:', JSON.stringify(metaBody, null, 2));
    const metaResp = await fetch('https://graph.facebook.com/v18.0/710553965483257/messages', {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${process.env.META_ACCESS_TOKEN}`,
        'Content-Type': "application/json",
      },
      body: JSON.stringify(metaBody),
    });

    const metaJson = await metaResp.json();
    console.log('📱 Respuesta de Meta API:', metaJson);
    if (!metaResp.ok) {
      console.error("Meta API error:", metaJson);
      return NextResponse.json({
        success: false,
        warning: "Acción registrada pero fallo envío de mensaje",
        meta_error: metaJson,
        accion_comercial: accionCom
      }, { status: 207 });
    }

    return NextResponse.json({
      success: true,
      message: "Acción comercial registrada y mensaje enviado",
      meta_message_id: metaJson?.messages?.[0]?.id || null,
      accion_comercial: accionCom
    });

  } catch (err) {
    console.error("Error en /api/accion_comercial:", err);
    return NextResponse.json({ error: "Error interno", details: err.message }, { status: 500 });
  }
}
