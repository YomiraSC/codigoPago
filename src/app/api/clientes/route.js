import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bigquery from "@/lib/bigquery";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const orderBy = searchParams.get("orderBy") || "fecha_creacion";
    const order = searchParams.get("order") || "asc";
    const search = searchParams.get("search") || "";
    const activo = searchParams.get("activo");
    const tipoCod = searchParams.get("tipoCod");
    const bound = searchParams.get("bound");
    let fechaInicio = searchParams.get("fechaInicio");
    let fechaFin = searchParams.get("fechaFin");

    console.log("🔎 Parámetros recibidos:", { page, pageSize, search, activo, tipoCod, bound, fechaInicio, fechaFin, orderBy, order });

    // 🛠️ Validar fechas (evitar null)
    fechaInicio = fechaInicio && fechaInicio !== "null" ? new Date(fechaInicio) : undefined;
    fechaFin = fechaFin && fechaFin !== "null" ? new Date(fechaFin) : undefined;

    console.log("📌 Fechas después de validación:", { fechaInicio, fechaFin });

    // 🛠️ Construcción de filtros dinámicos
    let filtros = {};

    // if (search) {
    //   /* filtros.OR = [
    //     { nombre: { contains: search, mode: "insensitive" } },
    //     { documento_identidad: { contains: search, mode: "insensitive" } },
    //   ]; */
    //   const searchLower = search.toLowerCase();
  
    //   filtros.OR = [
    //     { nombre: { contains: searchLower } },
    //     { apellido: {contains: searchLower}},
    //     { documento_identidad: { contains: searchLower } },
    //   ];
    // }
    if (search) {
      const searchLower = search.toLowerCase();
    
      filtros.OR = [
        { nombre: { contains: searchLower, mode: "insensitive" } },
        { apellido: { contains: searchLower, mode: "insensitive" } },
        { documento_identidad: { contains: searchLower, mode: "insensitive" } },
        // {
        //   AND: searchLower.split(" ").length >= 2 ? [
        //     { nombre: { contains: searchLower.split(" ")[0], mode: "insensitive" } },
        //     { apellido: { contains: searchLower.split(" ")[1], mode: "insensitive" } },
        //   ] : [],
        // },
      ];
    }
    

    /* if (activo && activo !== "Todos") {
      filtros.codigo_pago = {
        some: {
          activo: activo === "Activo" ? true : false// ✅ Se filtra dentro de `codigo_pago`
        }
      };
      
    }
    if (tipoCod && tipoCod !== "Todos") {
      filtros.codigo_pago = {
        some: {
          tipo_codigo: tipoCod // ✅ Se filtra dentro de `codigo_pago`
        }
      };
      
    } */
    /* if ((activo && activo !== "Todos") || (tipoCod && tipoCod !== "Todos")) {
      filtros.codigo_pago = {
        some: {
          ...(activo && activo !== "Todos" && { activo: activo === "Activo" }),
          ...(tipoCod && tipoCod !== "Todos" && { tipo_codigo: tipoCod }),
        }
      };
    } */

    if ((activo && activo !== "Todos") || (tipoCod && tipoCod !== "Todos") || (fechaInicio && fechaFin)) {
      filtros.codigo_pago = {
        some: {
          ...(activo && activo !== "Todos" && { pago_realizado: activo === "Cancelado" }),
          ...(tipoCod && tipoCod !== "Todos" && { tipo_codigo: { equals: tipoCod, mode: "insensitive" }  }),
          ...(fechaInicio && fechaFin && {
            fecha_asignacion: {
              gte: fechaInicio,
              lte: fechaFin,
            },
          }),
        },
      };
    }


    if (bound && bound !== "Todos") {
      filtros.bound = bound === "INBOUND";
    }
    

    


    /* if (fechaInicio && fechaFin) {
      if (!filtros.codigo_pago) {
        filtros.codigo_pago = {};
      }
    
      filtros.codigo_pago.some = {
        fecha_asignacion: {
          gte: fechaInicio, // Mayor o igual a la fecha de inicio
          lte: fechaFin,    // Menor o igual a la fecha de fin
        }
      };
    } */

    console.log("📌 Filtros aplicados clientes:", filtros);

    // 🛠️ Obtener clientes con Prisma
    // const clientes = await prisma.cliente.findMany({
    //   where: filtros,
    //   orderBy: { [orderBy]: order },
    //   take: pageSize,
    //   skip: (page - 1) * pageSize,
      
    // });
    const clientes = await prisma.cliente.findMany({
      where: filtros,
      
      orderBy: { [orderBy]: order },
      take: pageSize,
      skip: (page - 1) * pageSize,
      select: {
        documento_identidad: true,
        cliente_id: true,
        nombre: true,
        apellido: true,
        celular: true,

        codigo_pago: {
          take: 1, // Solo el código más reciente
          orderBy: { fecha_asignacion: "desc" }, // Ordenar por fecha de creación descendente
          select: {
            tipo_codigo: true,
            codigo: true,
            activo: true,
            id_contrato: true,
            fecha_asignacion: true,
            pago_realizado: true,
          }
        }
      }
    });
    const contratos = clientes.map((c) => c.codigo_pago[0]?.id_contrato).filter(Boolean);

    if (contratos.length > 0) {
      const query = `
        SELECT Codigo_Asociado, Pago_cuota 
        FROM \`peak-emitter-350713.FR_general.bd_fondos\`
        WHERE Codigo_Asociado IN UNNEST(@contratos)
      `;
      const options = { query, params: { contratos } };
      const [rows] = await bigquery.query(options);

      const pagosMap = rows.reduce((acc, row) => {
        acc[row.id_contrato] = row.Pago_cuota === "Si";
        return acc;
      }, {});
        // 🔄 Actualizar la base de datos con los valores de pago_realizado obtenidos de BigQuery
      // for (const cliente of clientes) {
      //   if (cliente.codigo_pago && cliente.codigo_pago.length > 0) {
      //     const codigoPago = cliente.codigo_pago[0];
      //     const nuevoEstadoPago = pagosMap[codigoPago.id_contrato] || false;

      //     await prisma.codigo_pago.updateMany({
      //       where: { id_contrato: codigoPago.id_contrato },
      //       data: { pago_realizado: nuevoEstadoPago },
      //     });

      //     // También actualizamos en memoria para devolver la info correcta
      //     codigoPago.pago_realizado = nuevoEstadoPago;
      //   }
      // }
      // Actualizar estados de pago en paralelo
      const updates = clientes.map(cliente => {
        const codigoPago = cliente.codigo_pago[0];
        if (codigoPago) {
          const nuevoEstado = pagosMap[codigoPago.id_contrato] || false;
          return prisma.codigo_pago.updateMany({
            where: { id_contrato: codigoPago.id_contrato },
            data: { pago_realizado: nuevoEstado },
          }).catch(() => null); // No cortar todo si un update falla
        }
      }).filter(Boolean);

      await Promise.all(updates);
      // clientes.forEach((cliente) => {
      //   //const codigoPago = cliente.codigo_pago[0] || {};

      //   cliente.codigo_pago[0].pago_realizado = pagosMap[cliente.codigo_pago[0].id_contrato] || false;
      //   console.log("pago realizado?: ", cliente.codigo_pago[0].pago_realizado? "sí":"no", " pago couta: ", pagosMap[cliente.codigo_pago[0].id_contrato]? "si couta": "no couta");
      // });
    }
    const clientesTransformados = clientes.map(cliente => {
      
      const codigoPago = cliente.codigo_pago.length > 0 ? cliente.codigo_pago[0] : {};  
      return {
        ...cliente,
        nombreCompleto: `${cliente.nombre} ${cliente.apellido}`, // Concatenar nombre y apellido
        tipo_codigo: codigoPago.tipo_codigo || null,
        codigo_pago: codigoPago.codigo || null,
        id_contrato: codigoPago.id_contrato || null,
        activo: codigoPago.activo ? "Activo" : "Vencido", 
        pago_realizado: codigoPago.pago_realizado ? "Cancelado" : "Vigente",
        fecha_asignacion: (() => {
          const fecha = new Date(codigoPago.fecha_asignacion);
          return isNaN(fecha.getTime()) ? null : fecha.toISOString().split('T')[0];
      })(),
      
      };
    });
    //console.log("Nombre completo generado:", `${cliente.nombre} ${cliente.apellido}`);

    console.log(clientesTransformados);

    console.log("✅ Clientes obtenidos:", clientes.length);

    // 🛠️ Obtener total de clientes
    const totalClientes = await prisma.cliente.count({ where: filtros });

    // 🚨 Verificar valores antes de responder
    if (!clientes || !Array.isArray(clientes)) {
      console.warn("⚠️ No se encontraron clientes. Enviando array vacío.");
      return NextResponse.json({ clientes: [], total: 0 });
    }

    return NextResponse.json({
        clientes: clientesTransformados.map(cliente => ({
          ...cliente,
          id: cliente.cliente_id, // ✅ Cambiamos `cliente_id` a `id`
        })), total: totalClientes });
  } catch (error) {
    console.error("❌ Error en el try-catch:", error);

    return NextResponse.json(
      { error: "Error al obtener clientes", message: error.message || "Error desconocido" },
      { status: 500 }
    );
  }
}


//CONSIDERANDO TODOS LOS CODIGOS DE PAGO:
// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
// import bigquery from "@/lib/bigquery";

// export async function GET(req) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const page       = parseInt(searchParams.get("page")     || "1", 10);
//     const pageSize   = parseInt(searchParams.get("pageSize") || "10", 10);
//     const orderBy    = searchParams.get("orderBy")          || "fecha_creacion";
//     const order      = searchParams.get("order")            || "asc";
//     const search     = searchParams.get("search")           || "";
//     const activo     = searchParams.get("activo");
//     const tipoCod    = searchParams.get("tipoCod");
//     const bound      = searchParams.get("bound");
//     let   fechaInicio= searchParams.get("fechaInicio");
//     let   fechaFin   = searchParams.get("fechaFin");

//     // Validar fechas
//     fechaInicio = fechaInicio && fechaInicio !== "null" ? new Date(fechaInicio) : undefined;
//     fechaFin    = fechaFin    && fechaFin    !== "null" ? new Date(fechaFin)    : undefined;

//     // Construcción de filtros dinámicos
//     const filtros = {};
//     if (search) {
//       const s = search.toLowerCase();
//       filtros.OR = [
//         { nombre: { contains: s } },
//         { apellido: { contains: s } },
//         { documento_identidad: { contains: s } },
//       ];
//     }
//     if ((activo && activo !== "Todos") ||
//         (tipoCod && tipoCod !== "Todos") ||
//         (fechaInicio && fechaFin)) {
//       filtros.codigo_pago = {
//         some: {
//           ...(activo && activo !== "Todos" && { pago_realizado: activo === "Cancelado" }),
//           ...(tipoCod && tipoCod !== "Todos" && { tipo_codigo: { equals: tipoCod, mode: "insensitive" } }),
//           ...(fechaInicio && fechaFin && {
//             fecha_asignacion: { gte: fechaInicio, lte: fechaFin }
//           }),
//         }
//       };
//     }
//     if (bound && bound !== "Todos") {
//       filtros.bound = bound === "INBOUND";
//     }

//     // 1️⃣ Obtener clientes y TODOS sus códigos pendientes
//     const clientes = await prisma.cliente.findMany({
//       where: filtros,
//       orderBy: { [orderBy]: order },
//       take: pageSize,
//       skip: (page - 1) * pageSize,
//       select: {
//         cliente_id: true,
//         nombre: true,
//         apellido: true,
//         celular: true,
//         documento_identidad: true,
//         codigo_pago: {
//           where: { pago_realizado: false },
//           orderBy: { fecha_asignacion: "desc" },
//           select: {
//             id_contrato: true,
//             tipo_codigo: true,
//             codigo: true,
//             fecha_asignacion: true,
//             activo: true,
//           }
//         }
//       }
//     });

//     // 2️⃣ Preparar lista de contratos para BigQuery
//     const contratos = clientes
//       .flatMap(c => c.codigo_pago.map(cp => cp.id_contrato))
//       .filter(Boolean);

//     // 3️⃣ Si hay contratos, consultar BigQuery y actualizar DB
//     if (contratos.length > 0) {
//       const query = `
//         SELECT Codigo_Asociado AS id_contrato, Pago_cuota
//         FROM \`peak-emitter-350713.FR_general.bd_fondos\`
//         WHERE Codigo_Asociado IN UNNEST(@contratos)
//       `;
//       const options = { query, params: { contratos } };
//       const [rows] = await bigquery.query(options);

//       // Mapear id_contrato => pago_realizado
//       const pagosMap = rows.reduce((acc, row) => {
//         acc[row.id_contrato] = row.Pago_cuota === "Si";
//         return acc;
//       }, {});
//       for (const cliente of clientes) {
//         for (const cp of cliente.codigo_pago) {
//           const nuevoEstado = pagosMap[cp.id_contrato] || false;
//           await prisma.codigo_pago.updateMany({
//             where: { id_contrato: cp.id_contrato },
//             data:  { pago_realizado: nuevoEstado },
//           });
//           cp.pago_realizado = nuevoEstado;
//         }
//       }
//     }

//     // 4️⃣ Construir la respuesta “plana”: una fila por código de pago
//     const filas = clientes.flatMap(cliente => {
//       const base = {
//         id: cliente.cliente_id,
//         nombreCompleto: `${cliente.nombre} ${cliente.apellido}`,
//         celular: cliente.celular,
//         documento_identidad: cliente.documento_identidad,
//       };
//       if (cliente.codigo_pago.length === 0) {
//         return [{
//           ...base,
//           id_contrato:   null,
//           tipo_codigo:   null,
//           codigo:        null,
//           fecha_asignacion: null,
//           activo:        "Sin códigos pendientes",
//           pago_realizado:"Vigente"
//         }];
//       }
//       return cliente.codigo_pago.map(cp => ({
//         ...base,
//         id_contrato:     cp.id_contrato,
//         tipo_codigo:     cp.tipo_codigo,
//         codigo:          cp.codigo,
//         fecha_asignacion: cp.fecha_asignacion.toISOString().split("T")[0],
//         activo:          cp.activo ? "Activo" : "Vencido",
//         pago_realizado:  cp.pago_realizado ? "Cancelado" : "Vigente"
//       }));
//     });

//     // Total de clientes para paginación
//     const totalClientes = await prisma.cliente.count({ where: filtros });

//     return NextResponse.json({ clientes: filas, total: totalClientes });
//   } catch (error) {
//     console.error("❌ Error en GET /clientes:", error);
//     return NextResponse.json(
//       { error: "Error al obtener clientes", message: error.message || "Desconocido" },
//       { status: 500 }
//     );
//   }
// }
