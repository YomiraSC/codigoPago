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
    const documentos = clients
      .map(client => client.documento_identidad ? String(client.documento_identidad) : null)
      .filter(Boolean);
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
              console.log("Campaña creada con ID:", clients.length);

        // OPTIMIZACIÓN 2: Obtener todos los clientes existentes de una vez
        // ...existing code...
      const clientesExistentes = await prisma.cliente.findMany({
        where: {
          OR: [
            { celular: { in: celulares } },
            { documento_identidad: { in: documentos } }
          ]
        },
        select: {
          cliente_id: true,
          celular: true,
          documento_identidad: true
        }
      });
// ...existing code...

        // Crear mapa para búsqueda rápida
        // ...existing code...
        const clientesMap = new Map();
        for (const c of clientesExistentes) {
          if (c.celular) clientesMap.set(c.celular, c);
          if (c.documento_identidad) clientesMap.set(c.documento_identidad, c);
        }
// ...existing code...

        // OPTIMIZACIÓN 3: Preparar datos para inserción masiva
        const clientesParaCrear = [];
        const asociacionesParaCrear = [];
        const firestoreOps = [];

        const clientesParaActualizar = [];
        
        for (const clientData of clients) {
          const { nombre, celular, code_pago, documento_identidad, modelo, feccuota } = clientData;
          const finalNombre = nombre || "Nombre desconocido";
          const finalCelular = celular ? "+51" + celular.toString().replace(/\s+/g, "") : null;
          const finalCodPago = code_pago && code_pago.trim() !== "" ? String(code_pago).slice(0, 50) : null;
          const finalModelo = modelo || " ";
          const finalFeccuota = feccuota || " ";
          if (!finalCelular) continue;
          console.log("📞 Buscando cliente con celular:", finalCelular);
          const cliente = todosClientes.get(finalCelular);

if (!cliente) {
  console.log("❌ NO encontrado en Map:", finalCelular);
  continue;
}
          if (cliente) {
            // Cliente ya existe: preparar para actualización masiva
            clientesParaActualizar.push({
              cliente_id: cliente.cliente_id,
              celular: finalCelular,
              code_pago: finalCodPago,
              modelo: finalModelo,
              feccuota: finalFeccuota
            });
          } else {
            // Cliente nuevo: agregar al array para createMany
            clientesParaCrear.push({
              nombre: finalNombre?.toString().slice(0, 100) || "Nombre desconocido",
              celular: finalCelular?.toString().slice(0, 20),
              documento_identidad: documento_identidad ? String(documento_identidad).slice(0, 12) : "",
              estado: " ",
              fecha_creacion: new Date(),
              code_pago: finalCodPago,
              modelo: finalModelo,
              feccuota: finalFeccuota
            });
          }
        }

        // Actualización masiva de clientes existentes
        if (clientesParaActualizar.length > 0) {
          console.log("Actualizando clientes existentes:", clientesParaActualizar.length);
          
          // Optimización: Actualizar en paralelo usando Promise.all
          const updatePromises = clientesParaActualizar.map(clienteUpdate => 
            prisma.cliente.update({
              where: { cliente_id: clienteUpdate.cliente_id },
              data: {
                celular: clienteUpdate.celular,
                code_pago: clienteUpdate.code_pago,
              }
            })
          );
          
          await Promise.all(updatePromises);
          console.log("Clientes actualizados:", clientesParaActualizar.length);
        }

        // OPTIMIZACIÓN 4: Inserción masiva de clientes nuevos
        let clientesCreados = [];
        if (clientesParaCrear.length > 0) {
          console.log("Creando clientes nuevos:", clientesParaCrear.length);
          
          await prisma.cliente.createMany({
            data: clientesParaCrear,
            skipDuplicates: true
          });
          
          console.log("Clientes creados, ahora consultando...");
          
          // Consultar los clientes recién creados
          const nuevosCelulares = clientesParaCrear.map(c => c.celular);
          clientesCreados = await prisma.cliente.findMany({
            where: { 
              celular: { in: nuevosCelulares } 
            }
          });
          
          console.log("Clientes consultados:", clientesCreados.length);
        }

        // Crear mapa completo con clientes nuevos y existentes
        const todosClientes = new Map(clientesMap);
        clientesCreados.forEach(c => {
          if (c.celular) todosClientes.set(c.celular, c);
          if (c.documento_identidad) todosClientes.set(c.documento_identidad, c);
        });
        
console.log("🔍 Total clientes en todosClientes:", todosClientes.size);
console.log("🔍 Ejemplo keys todosClientes:", [...todosClientes.keys()].slice(0, 5));
        // OPTIMIZACIÓN: Manejo masivo de códigos de pago
        for (const clientData of clients) {
  const finalCelular = clientData.celular
    ? "+51" + clientData.celular.toString().replace(/\s+/g, "")
    : null;

  if (!finalCelular) continue;

  const cliente = todosClientes.get(finalCelular);

  if (!cliente) {
    console.warn("❌ Cliente no encontrado para:", finalCelular);
    continue;
  }

  console.log(
    "✅ Asociando cliente ID:",
    cliente.cliente_id,
    "con campaña ID:",
    campanha.campanha_id
  );

  asociacionesParaCrear.push({
    cliente_id: cliente.cliente_id,
    campanha_id: campanha.campanha_id,
  });
}

        const codigosParaCrear = [];
        const codigosPago = clients
          .map(c => c.code_pago)
          .filter(codigo => codigo && codigo.trim() !== "");

        // Obtener códigos existentes de una vez
        const codigosExistentes = codigosPago.length > 0 ? await prisma.codigo_pago.findMany({
          where: { codigo: { in: codigosPago } },
          select: { codigo: true }
        }) : [];

        const codigosExistentesSet = new Set(codigosExistentes.map(c => c.codigo));

        for (const clientData of clients) {
          const finalCelular = clientData.celular ? "+51" + clientData.celular.toString().replace(/\s+/g, "") : null;
          
          // Solo procesar si hay celular Y código de pago válido
          if (!finalCelular || !clientData.code_pago || clientData.code_pago.trim() === "") continue;

          const cliente = todosClientes.get(finalCelular);
          if (!cliente) continue;

          // Solo crear código si no existe
          if (!codigosExistentesSet.has(clientData.code_pago)) {
            codigosParaCrear.push({
              cliente_id: cliente.cliente_id,
              codigo: clientData.code_pago.toString().slice(0, 50),
              tipo_codigo: " ",
              fecha_asignacion: new Date(),
              activo: true,
              pago_realizado: false
            });
            // Agregar al set para evitar duplicados en este mismo batch
            codigosExistentesSet.add(clientData.code_pago);
          }
        }

        // Inserción masiva de códigos de pago
        if (codigosParaCrear.length > 0) {
          console.log("Creando códigos de pago:", codigosParaCrear.length);
          await prisma.codigo_pago.createMany({
            data: codigosParaCrear,
            skipDuplicates: true
          });
        }

        // OPTIMIZACIÓN 5: Preparar asociaciones y operaciones Firestore
        const fecha = new Date();
        const firestoreBatch = db ? db.batch() : null;
        console.log("🔍 Total clientes en todosClientes:", todosClientes.size);
console.log(
  "🔍 Ejemplo keys todosClientes:",
  Array.from(todosClientes.keys()).slice(0, 5)
);
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
        timeout: 2000000,
        maxWait: 200000
      }
    );

    const response = NextResponse.json({
      message: "Campaña y clientes creados con éxito",
      campanha: result.campanha,
      clientsProcessed: result.clientsProcessed,
    });

    return addCorsHeaders(response);

  } catch (error) {
    console.error("❌ Error:", error.message);
    const errorResponse = NextResponse.json({
      error: "Error al crear la campaña o agregar clientes",
      details: error.message,
    }, { status: 500 });

    return addCorsHeaders(errorResponse);
  }
}
