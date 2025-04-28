// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
// //import bigquery from "@/lib/bigquery";
//   import admin from "firebase-admin";
// // Inicializar Firestore solo si no está inicializado
//   if (!admin.apps.length) {
//     const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
//     admin.initializeApp({
//       credential: admin.credential.cert(serviceAccount),    
//     });
//   }
    
//   const db = admin.firestore();


// export async function GET(req) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const page = parseInt(searchParams.get("page") || "1", 10);
//     const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
//     const orderBy = searchParams.get("orderBy") || "creado_en";
//     const order = searchParams.get("order") || "asc";
//     const search = searchParams.get("search") || "";
//     const activo = searchParams.get("activo");
//     const tipoCod = searchParams.get("tipoCod");
//     const bound = searchParams.get("bound");
//     const responded = searchParams.get("responded");
//     let fechaInicio = searchParams.get("fechaInicio");
//     let fechaFin = searchParams.get("fechaFin");

//     console.log("🔎 Parámetros recibidos:", { page, pageSize, search, activo, tipoCod, responded, bound, fechaInicio, fechaFin, orderBy, order });

//     // 🛠️ Validar fechas (evitar null)
//     // fechaInicio = fechaInicio && fechaInicio !== "null" ? new Date(fechaInicio) : undefined;
//     // fechaFin = fechaFin && fechaFin !== "null" ? new Date(fechaFin) : undefined;

//     console.log("📌 Fechas después de validación:", { fechaInicio, fechaFin });

//     // 🛠️ Construcción de filtros dinámicos
//     let filtrosNuevos = {};

//     if (search) {
//       /* filtros.OR = [
//         { nombre: { contains: search, mode: "insensitive" } },
//         { documento_identidad: { contains: search, mode: "insensitive" } },
//       ]; */
//       const searchLower = search.toLowerCase();
  
//       filtrosNuevos.OR = [
//         { nombre: { contains: searchLower } },
//         { celular: { contains: searchLower} },
//       ];
//     }


//     console.log("📌 Filtros aplicados a nuevos:", filtrosNuevos);

//     const clientesNC = await prisma.campanha_temporal.findMany({
//       where: filtrosNuevos,
//       distinct: ['celular'],
//       orderBy: { [orderBy]: order },
//       take: pageSize, 
//       skip: (page - 1) * pageSize,
//       select: {
//         nombre: true,
//         celular: true,
//       }
//     });

    

//     console.log("✅ Clientes obtenidos nuevos:", clientesNC.length);
//     //console.log("🕵️‍♂️ Filtros usados:", filtros);
//     const clientesConFlag = await Promise.all(
//       clientesNC.map(async (c) => {
//         const celularFmt = c.celular.startsWith("+51")
//           ? c.celular
//           : `+51${c.celular}`;
//         // query rápida a Firestore
//         const respSnap = await db
//           .collection("test")
//           .where("celular", "==", celularFmt)
//           .where("id_bot", "==", "codigopago")
//           .where("sender", "==", true)
//           .limit(1)
//           .get();
//         return {
//           ...c,
//           responded: !respSnap.empty,
//         };
//       })
//     );
//     console.log("CLIENTES AL INICIO",clientesNC);
// // 3️⃣ Filtrar según el parametro
//     let clientesFiltered = clientesConFlag;
//     if (responded === "respondieron") {
//       clientesFiltered = clientesConFlag.filter(c => c.responded);
//     } else if (responded === "no respondieron") {
//       clientesFiltered = clientesConFlag.filter(c => !c.responded);
//     }

//     // 4️⃣ Total y paginación (ojo: esto ya NO será precisión SQL, 
//     //    pero respeta tu pageSize en la UI)
//     const total = clientesFiltered.length;
//     // const start = (page - 1) * pageSize;
//     // const end   = start + pageSize;
//     // const pageItems = clientesFiltered.slice(start, end);
//     const clientesPage = clientesFiltered; 

//     // 🛠️ Obtener total de clientes
//     // ✔️ asume que `filtros` es algo como { campaña_id: 3, activo: true, … }
//     const gruposNC = await prisma.campanha_temporal.groupBy({
//         by:    ['celular'],
//         where: filtrosNuevos
//       });
//     const totalClientes = gruposNC.length;
  

//     // 🚨 Verificar valores antes de responder
//     if (!clientesPage || !Array.isArray(clientesPage)) {
//       console.warn("⚠️ No se encontraron clientes. Enviando array vacío.");
//       return NextResponse.json({ clientesPage: [], total: 0 });
//     }

//     // return NextResponse.json({
//     //     clientes: clientesNC.map(cliente => ({
//     //       ...cliente,
//     //       c_cel: cliente.celular, 
//     //     })), total: totalClientes });

//     return NextResponse.json({
//       clientes: clientesPage.map(c => ({ 
//         ...c, 
//         c_cel: c.celular 
//       })),
//       total: totalClientes
//     });
//   } catch (error) {
//     console.error("❌ Error en el try-catch:", error);

//     return NextResponse.json(
//       { error: "Error al obtener clientes", message: error.message || "Error desconocido" },
//       { status: 500 }
//     );
//   }
// }


//NO FUNCIONA BUSQUEDA
// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
// import admin from "firebase-admin";

// // inicializa Firestore sólo una vez
// if (!admin.apps.length) {
//   const svc = JSON.parse(process.env.FIREBASE_CREDENTIALS);
//   admin.initializeApp({ credential: admin.credential.cert(svc) });
// }
// const db = admin.firestore();

// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const page     = parseInt(searchParams.get("page")     || "1", 10);
//   const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
//   const orderBy  = searchParams.get("orderBy")  || "creado_en";
//   const order    = searchParams.get("order")    || "asc";
//   const search   = searchParams.get("search")   || "";
//   const responded = searchParams.get("responded"); 
//   // let fechaInicio = searchParams.get("fechaInicio");
//   // let fechaFin = searchParams.get("fechaFin");
//   // (puede ser "respondieron", "noRespondieron" o null)
//   // fechaInicio = fechaInicio && fechaInicio !== "null" ? new Date(fechaInicio) : undefined;
//   // fechaFin = fechaFin && fechaFin !== "null" ? new Date(fechaFin) : undefined;
//   // construimos los filtros básicos
//   let filtrosNuevos = {};
//   if (search) {
//     filtrosNuevos.OR = [
//       { nombre:  { contains: search, mode: "insensitive" } },
//       { celular: { contains: search, mode: "insensitive"  } },
//     ];
//   }
//   // if (fechaInicio && fechaFin) {
  
//   //   filtrosNuevos.some = {
//   //     creado_en: {
//   //       gte: fechaInicio, // Mayor o igual a la fecha de inicio
//   //       lte: fechaFin,    // Menor o igual a la fecha de fin
//   //     }
//   //   };
//   // }
//   // 1️⃣ Conteo total (siempre queremos saber cuántos únicos hay)
//   const totalDistinct = (
//     await prisma.campanha_temporal.groupBy({
//       by:    ['celular'],
//       where: filtrosNuevos
//     })
//   ).length;

//   let clientsPage = [];
//   let total = totalDistinct;

//   if (!responded) {
//     // ─────────────────────────────────────────────────────────────
//     // Sin filtro de responded: paginamos directo en BD
//     const pageRaw = await prisma.campanha_temporal.findMany({
//       where:    filtrosNuevos,
//       distinct: ['celular'],
//       orderBy:  { [orderBy]: order },
//       take:     pageSize,
//       skip:     (page - 1) * pageSize,
//       select:   { nombre: true, celular: true }
//     });
//     clientsPage = pageRaw;

//   } else {
//     // ─────────────────────────────────────────────────────────────
//     // Con filtro de responded: leemos TODOS, marcamos y luego slice
//     const allRaw = await prisma.campanha_temporal.findMany({
//       where:    filtrosNuevos,
//       distinct: ['celular'],
//       orderBy:  { [orderBy]: order },
//       select:   { nombre: true, celular: true }
//     });

//     // marcamos cada uno
//     const allWithFlag = await Promise.all(
//       allRaw.map(async c => {
//         const cel = c.celular.startsWith('+51')
//           ? c.celular
//           : '+51' + c.celular;
//         const snap = await db
//           .collection('test')
//           .where('celular', '==', cel)
//           .where('id_bot', '==', 'codigopago')
//           .where('sender', '==', true)
//           .limit(1)
//           .get();
//         return { ...c, responded: !snap.empty };
//       })
//     );

//     // filtramos según respondieron / noRespondieron
//     let filtered = allWithFlag;
//     if (responded === 'respondieron') {
//       filtered = filtered.filter(c => c.responded);
//     } else {
//       filtered = filtered.filter(c => !c.responded);
//     }

//     // nuevo total y slice de la página
//     total = filtered.length;
//     const start = (page - 1) * pageSize;
//     clientsPage = filtered.slice(start, start + pageSize);
//   }

//   // 2️⃣ Devolvemos JSON con clientsPage y total
//   return NextResponse.json({
//     clientes: clientsPage.map(c => ({ ...c, c_cel: c.celular })),
//     total
//   });
// }

//DEMORA EN VERCEL
// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
// import admin from "firebase-admin";

// // Inicializar Firestore sólo una vez
// if (!admin.apps.length) {
//   const svc = JSON.parse(process.env.FIREBASE_CREDENTIALS);
//   admin.initializeApp({ credential: admin.credential.cert(svc) });
// }
// const db = admin.firestore();

// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const page     = parseInt(searchParams.get("page") || "1", 10);
//   const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
//   const orderBy  = searchParams.get("orderBy") || "creado_en";
//   const order    = searchParams.get("order") || "asc";
//   const search   = searchParams.get("search") || "";
//   const responded = searchParams.get("responded");

//   let filtrosNuevos = {};
//   if (search) {
//     filtrosNuevos.OR = [
//       { nombre: { contains: search, mode: "insensitive" } },
//       { celular: { contains: search, mode: "insensitive" } },
//     ];
//   }

//   // 1️⃣ Buscar registros en BD aplicando sólo filtro search
//   let registros = await prisma.campanha_temporal.findMany({
//     where: filtrosNuevos,
//     orderBy: { [orderBy]: order },
//     select: { nombre: true, celular: true },
//   });

//   // 2️⃣ Eliminar duplicados por celular
//   const seen = new Set();
//   registros = registros.filter(cliente => {
//     if (seen.has(cliente.celular)) return false;
//     seen.add(cliente.celular);
//     return true;
//   });

//   // 3️⃣ Verificar responded para todos los registros (solo si se requiere)
//   let registrosFinales = registros;

//   if (responded && responded !== "todos") {
//     const registrosWithResponse = await Promise.all(
//       registros.map(async (c) => {
//         const celularFmt = c.celular.startsWith("+51") ? c.celular : `+51${c.celular}`;
//         const snap = await db
//           .collection("test")
//           .where("celular", "==", celularFmt)
//           .where("id_bot", "==", "codigopago")
//           .where("sender", "==", true)
//           .limit(1)
//           .get();
//         return { ...c, responded: !snap.empty };
//       })
//     );

//     if (responded === "respondieron") {
//       registrosFinales = registrosWithResponse.filter(c => c.responded);
//     } else if (responded === "no respondieron") {
//       registrosFinales = registrosWithResponse.filter(c => !c.responded);
//     }
//   }

//   // 4️⃣ Ahora sí: paginar el resultado final
//   const total = registrosFinales.length;
//   const start = (page - 1) * pageSize;
//   const clientsPage = registrosFinales.slice(start, start + pageSize);

//   // 5️⃣ Respuesta
//   return NextResponse.json({
//     clientes: clientsPage.map(c => ({
//       ...c,
//       c_cel: c.celular,
//     })),
//     total
//   });
// }

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import admin from "firebase-admin";

// Inicializar Firestore sólo una vez
if (!admin.apps.length) {
  const svc = JSON.parse(process.env.FIREBASE_CREDENTIALS);
  admin.initializeApp({ credential: admin.credential.cert(svc) });
}
const db = admin.firestore();

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page     = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const orderBy  = searchParams.get("orderBy") || "creado_en";
    const order    = searchParams.get("order") || "asc";
    const search   = searchParams.get("search") || "";
    const responded = searchParams.get("responded");

    let filtrosNuevos = {};
    if (search) {
      filtrosNuevos.OR = [
        { nombre: { contains: search, mode: "insensitive" } },
        { celular: { contains: search, mode: "insensitive" } },
      ];
    }

    // 1️⃣ Buscar registros aplicando solo el filtro de búsqueda
    let registros = await prisma.campanha_temporal.findMany({
      where: filtrosNuevos,
      orderBy: { [orderBy]: order },
      select: { nombre: true, celular: true },
    });

    // 2️⃣ Eliminar duplicados por celular
    const seen = new Set();
    registros = registros.filter(cliente => {
      if (seen.has(cliente.celular)) return false;
      seen.add(cliente.celular);
      return true;
    });

    // 3️⃣ Paginación temprana para optimizar
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    let registrosPaginados = registros.slice(start, end);

    // 4️⃣ Si se necesita verificar "responded", preparar set de celulares que respondieron
    if (responded && responded !== "todos") {
      // Obtener de Firestore todos los celulares que respondieron
      const snapshot = await db
        .collection("test")
        .where("id_bot", "==", "codigopago")
        .where("sender", "==", true)
        .get();

      const celularesRespondidos = new Set();
      snapshot.forEach(doc => {
        celularesRespondidos.add(doc.data().celular);
      });

      // Agregar campo responded a cada cliente paginado
      registrosPaginados = registrosPaginados.map(c => {
        const celularFmt = c.celular.startsWith("+51") ? c.celular : `+51${c.celular}`;
        return { ...c, responded: celularesRespondidos.has(celularFmt) };
      });

      // Filtrar según responded
      if (responded === "respondieron") {
        registrosPaginados = registrosPaginados.filter(c => c.responded);
      } else if (responded === "no respondieron") {
        registrosPaginados = registrosPaginados.filter(c => !c.responded);
      }
    }

    // 5️⃣ Respuesta
    return NextResponse.json({
      clientes: registrosPaginados.map(c => ({
        ...c,
        c_cel: c.celular,
      })),
      total: registros.length, // el total sigue siendo todos los registros después de filtros iniciales
    });

  } catch (error) {
    console.error("Error en nuevasConver:", error);
    return NextResponse.json({ error: "Error interno en el servidor." }, { status: 500 });
  }
}
