import { NextResponse } from "next/server";
import admin from "firebase-admin"; // Usar Firebase Admin para Firestore
import prisma from "@/lib/prisma"; // Prisma para la base de datos relacional (PostgreSQL)

let db;
try {
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS); // Credenciales de Firebase
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  db = admin.firestore();
} catch (error) {
  console.warn("⚠️ Firebase initialization failed:", error.message);
  // Continue without Firebase if credentials are not available
}

function addCorsHeaders(response) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function OPTIONS(req) {
  return addCorsHeaders(new NextResponse(null, { status: 200 }));
}

export async function POST(req, context) {
  try {
    const body = await req.json();
    const { nombre_campanha, descripcion, template_id, fecha_inicio, fecha_fin, clients, variableMappings } = body;

    // Validaciones básicas
    if (!nombre_campanha) {
      return NextResponse.json({ error: "nombre_campanha es requerido" }, { status: 400 });
    }

    if (!clients || !Array.isArray(clients)) {
      return NextResponse.json({ error: "clients debe ser un array" }, { status: 400 });
    }

    // Cargamos el mensaje base de la plantilla (una sola vez)
    let tplMensaje = ""
    if (template_id) {
      const tpl = await prisma.template.findUnique({
        where: { id: parseInt(template_id) }
      })
      tplMensaje = tpl?.mensaje || ""
    }

    // Preparar datos
    const finalFechaInicio = fecha_inicio ? new Date(fecha_inicio) : new Date();
    const finalFechaFin = fecha_fin ? new Date(fecha_fin) : null;
    const finalDescripcion = descripcion || "Descripción no proporcionada";
    const finalTemplateId = template_id ? parseInt(template_id) : null;
    const finalEstadoCampanha = "activa";
    const finalMensajeCliente = "Mensaje predeterminado";

    // OPTIMIZACIÓN 1: Preparar todos los números de celular de una vez
    const celulares = clients.map(client => {
      const celular = client.celular;
      return celular ? "+51" + celular.toString().replace(/\s+/g, "") : null;
    }).filter(Boolean);

    const result = await prisma.$transaction(async (prisma) => {
      // Crear la campaña
      const campanha = await prisma.campanha.create({
        data: {
          nombre_campanha,
          descripcion: finalDescripcion,
          template_id: finalTemplateId,
          fecha_inicio: finalFechaInicio,
          fecha_fin: finalFechaFin,
          estado_campanha: finalEstadoCampanha,
          mensaje_cliente: finalMensajeCliente,
          variable_mappings: variableMappings,
        },
      });

      console.log("Campaña creada con ID:", campanha.campanha_id);

      if (clients.length > 0) {
        // OPTIMIZACIÓN 2: Obtener todos los clientes existentes de una vez
        const clientesExistentes = await prisma.cliente.findMany({
          where: {
            celular: { in: celulares }
          },
          select: {
            cliente_id: true,
            celular: true
          }
        });

        // Crear mapa para búsqueda rápida
        const clientesMap = new Map(
          clientesExistentes.map(c => [c.celular, c])
        );

        // OPTIMIZACIÓN 3: Preparar datos para inserción masiva
        const clientesParaCrear = [];
        const asociacionesParaCrear = [];
        const firestoreOps = [];

        for (const clientData of clients) {
          console.log("Datos del cliente:", clientData);
          const { nombre, celular, code_pago, documento_identidad } = clientData;
          const finalNombre = nombre || "Nombre desconocido";
          const finalCelular = celular ? "+51" + celular.toString().replace(/\s+/g, "") : null;
          console.log("Procesando cliente:", finalCelular);
          const finalCodPago = code_pago || "";
          if (!finalCelular) continue;

          let cliente = clientesMap.get(finalCelular);

          if (cliente) {
            // **Cliente ya existe: actualizamos sus nuevos campos**
            await prisma.cliente.update({
              where: { cliente_id: cliente.cliente_id },
              data: {
                celular: finalCelular,
                code_pago: finalCodPago,
              }
            });


          } else {
            // Cliente nuevo: lo metemos en el array para createMany
            console.log("Cliente nuevoaaaaaaaaasdasdasdaaa pusheado a crear:", finalCelular);

            clientesParaCrear.push({
              nombre: finalNombre,
              celular: finalCelular,
              documento_identidad: documento_identidad || "",
              categoria_no_interes: " ",
              bound: false,
              estado: " ",
              observacion: "Observación no proporcionada",
              score: "no_score",
              fecha_creacion: new Date(),
              code_pago: finalCodPago,
            });
            console.log("Cliente nuevoaaaaaaaaaaa pusheado a crear:", finalCelular);

          }

        }

        // OPTIMIZACIÓN 4: Inserción masiva de clientes nuevos
        let clientesCreados = [];
        if (clientesParaCrear.length > 0) {
          clientesCreados = await prisma.cliente.createManyAndReturn({
            data: clientesParaCrear
          });
        }

        // Crear mapa completo con clientes nuevos y existentes
        const todosClientes = new Map(clientesMap);
        clientesCreados.forEach(c => todosClientes.set(c.celular, c));

        for (const clientData of clients) {
          const finalCelular = clientData.celular ? "+51" + clientData.celular.toString().replace(/\s+/g, "") : null;
          if (!finalCelular || !clientData.code_pago) continue;

          const cliente = todosClientes.get(finalCelular);
          if (!cliente) continue;

          // Verifica si ya existe el código para evitar duplicados
          const codigoExistente = await prisma.codigo_pago.findUnique({
            where: { codigo: clientData.code_pago }
          });

          if (!codigoExistente) {
            await prisma.codigo_pago.create({
              data: {
                cliente_id: cliente.cliente_id,
                codigo: clientData.code_pago,
                tipo_codigo: " ",
                fecha_asignacion: new Date(),
                activo: true,
                pago_realizado: false
              }
            });
          }
        }

        // OPTIMIZACIÓN 5: Preparar asociaciones y operaciones Firestore
        const fecha = new Date();
        const firestoreBatch = db ? db.batch() : null;

        for (const clientData of clients) {
          const { celular } = clientData;
          const finalCelular = celular ? "+51" + celular.toString().replace(/\s+/g, "") : null;

          if (!finalCelular) continue;

          const cliente = todosClientes.get(finalCelular);
          if (!cliente) continue;
          console.log("Asociando cliente ID:", cliente.cliente_id, "con campaña ID:", campanha.campanha_id);
          // Preparar asociación
          asociacionesParaCrear.push({
            cliente_id: cliente.cliente_id,
            campanha_id: campanha.campanha_id,
          });

          // Preparar mensaje personalizado
          let mensajePersonalizado = tplMensaje;
          for (const [idx, campo] of Object.entries(variableMappings || {})) {
            const valor = clientData[campo] || "";
            mensajePersonalizado = mensajePersonalizado.replace(
              new RegExp(`{{\\s*${idx}\\s*}}`, "g"),
              valor
            );
          }

          // Preparar operación Firestore en batch
          if (firestoreBatch) {
            const docRef = db.collection("test").doc(finalCelular);
            firestoreBatch.set(docRef, {
              celular: finalCelular,
              fecha: admin.firestore.Timestamp.fromDate(fecha),
              id_bot: "codigopago",
              id_cliente: cliente.cliente_id,
              mensaje: mensajePersonalizado || "Mensaje inicial de la campaña",
              sender: "false",
            });
          }
        }

        // OPTIMIZACIÓN 6: Inserción masiva de asociaciones
        if (asociacionesParaCrear.length > 0) {
          await prisma.cliente_campanha.createMany({
            data: asociacionesParaCrear,
            skipDuplicates: true
          });
          console.log("Asociaciones cliente-campaña creadas:", asociacionesParaCrear.length);
        }

        // OPTIMIZACIÓN 7: Ejecutar todas las operaciones Firestore en batch
        if (firestoreBatch) {
          await firestoreBatch.commit();
        }
      }

      return {
        campanha,
        clientsProcessed: clients.length,
      };
    },
      {
        timeout: 200000,
        maxWait: 20000
      }
    );

    const response = NextResponse.json({
      message: "Campaña y clientes creados con éxito",
      campanha: result.campanha,
      clientsProcessed: result.clientsProcessed,
    });

    return addCorsHeaders(response);

  } catch (error) {
    console.error("❌ Error:", error);
    const errorResponse = NextResponse.json({
      error: "Error al crear la campaña o agregar clientes",
      details: error.message,
    }, { status: 500 });

    return addCorsHeaders(errorResponse);
  }
}
