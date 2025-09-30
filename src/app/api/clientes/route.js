// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";

// export async function GET(req) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const page = parseInt(searchParams.get("page") || "1", 10);
//     const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
//     //const orderBy = searchParams.get("orderBy") || "fecha_ultima_interaccion_bot";
//     const orderBy ="fecha_ultima_interaccion_bot";

//     //const order = searchParams.get("order") || "asc";
//     const order = "desc";
//     const search = searchParams.get("search") || "";
//     const estado = searchParams.get("estado");
//     const bound = searchParams.get("bound");
//     let fechaInicio = searchParams.get("fechaInicio");
//     let fechaFin = searchParams.get("fechaFin");
//     const gestor =searchParams.get("gestor");
//     const role = searchParams.get("role");
//     const accionComercial = searchParams.get("accionComercial"); //
//     const interaccionBot = searchParams.get("interaccionBot"); // Nuevo parámetro
//     let fechaRegistro = searchParams.get("fechaRegistro");
    

//     console.log("🔎 Parámetros recibidos:", { page, pageSize, search, estado, bound, fechaInicio, fechaFin, orderBy, order,gestor,accionComercial });

//     // 🛠️ Validar fechas (evitar null)
//     fechaInicio = fechaInicio && fechaInicio !== "null" ? new Date(fechaInicio) : undefined;
//     fechaFin = fechaFin && fechaFin !== "null" ? new Date(fechaFin) : undefined;

//     console.log("📌 Fechas después de validación:", { fechaInicio, fechaFin });

//     // 🛠️ Construcción de filtros dinámicos
//     let filtros = {};
//     if (fechaRegistro && fechaRegistro !== "null") {
//       const fecha = new Date(fechaRegistro);
//       const primerDiaMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
//       const ultimoDiaMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0, 23, 59, 59, 999);
    
//       filtros.fecha_creacion = {
//         gte: primerDiaMes,
//         lte: ultimoDiaMes,
//       };
//     }
    

//     if (search) {
//       filtros.OR = [
//         { nombre: { contains: search } },
//         { email: { contains: search} },
//         {celular: {contains: search}},
//       ];
//     }

//     if (estado && estado !== "Todos") {
//       filtros.estado = estado;
//     }

//     if (bound && bound !== "Todos") {
//       filtros.bound = bound === "INBOUND";
//     }

//     if (fechaInicio && fechaFin) {
//       filtros.fecha_ultima_interaccion_bot = {
//         gte: fechaInicio, // Mayor o igual a la fecha de inicio
//         lte: fechaFin, // Menor o igual a la fecha de fin
//       };
//     }
//     if ((gestor && gestor !== "Todos")&&(role=="Usuario")) {

//       filtros.gestor = gestor; // Si usas el nombre
//       console.log("Gestor aplicado:", filtros);
//       // o si utilizas gestor_id, sería:
//       // filtros.gestor_id = parseInt(gestor, 10);
//     }
//     if (accionComercial && accionComercial !== "Todos") {
//       // Buscar en las acciones comerciales más recientes del cliente
//       filtros.accion_comercial = {
//         some: {
//           estado: accionComercial
//         }
//       };
//     }
//     if (interaccionBot === "Con interacción") {
//   filtros.AND = [
//     { estado: { not: null } }, // Clientes con estado
//     { estado: { not: "activo" } },
//     { estado: { not: "no contactado" } }  // Pero que no sea "activo"
//   ];
// } else if (interaccionBot === "Sin interacción") {
//   filtros.estado = null; // Clientes sin fecha de interacción
// }
//     if (accionComercial === "Sin accion comercial") {
//       filtros.accion = ""; // Filtra por clientes que no tienen acción comercial
//     } 
    
    
//     console.log("📌 Filtros aplicados:", filtros);

//     // 🛠️ Calcular skip y take para paginación correcta
//     const skip = (page - 1) * pageSize;

//     // 🛠️ Obtener clientes con paginación correcta
//     let clientes = await prisma.cliente.findMany({
//       where: filtros,
//       orderBy: { [orderBy]: order },
//       take: pageSize, // Solo tomar exactamente lo que necesitamos
//       skip: skip, // Saltar los registros correctos según la página
//     });

//     // Opcional: Si quieres mantener el ordenamiento por prioridad, hazlo después
//     // pero esto puede afectar la paginación. Es mejor hacerlo en la query de Prisma
//     const prioridad = [
//       "Duda no resuelta",
//       "Codigo no entregado", 
//       "Promesa de pago",
//       "Duda resuelta",
//       "Codigo entregado"
//     ];
    
//     // Solo ordenar si no hay un orderBy específico del usuario
//     if (orderBy === "fecha_creacion") {
//       clientes = clientes.sort((a, b) => {
//         const idxA = prioridad.indexOf(a.estado || "");
//         const idxB = prioridad.indexOf(b.estado || "");
//         if (idxA === -1 && idxB === -1) return 0;
//         if (idxA === -1) return 1;
//         if (idxB === -1) return -1;
//         return idxA - idxB;
//       });
//     }

//     console.log(`✅ Clientes obtenidos para página ${page}:`, clientes.length);

//     // 🛠️ Obtener total de clientes
//     const totalClientes = await prisma.cliente.count({ where: filtros });
//     // 🗺️ Mapear la respuesta incluyendo estado/motivo desde contrato[0]
//     const payload = clientes.map(cliente => {
//   // Aquí puedes agregar otros campos que necesites
//   return {
//     ...cliente,                     // Conserva todos los campos originales de `cliente`
//     id: cliente.cliente_id,         // Agrega el `cliente_id` como `id`
//     estado: cliente.estado ?? null,  // Agrega `estado` (con valor por defecto si no existe)
//     // estado_asesor: cliente.estado_asesor ?? null,  // Campo obsoleto - ahora usamos el nuevo sistema de estados
//     // Otros campos que necesites agregar, por ejemplo:
//     nombre_completo: `${cliente.nombre} ${cliente.apellido}`, // Concatenar nombre y apellido
//     fecha_creacion: cliente.fecha_creacion?.toISOString(),  // Formatear la fecha de creación
//     // Agrega cualquier otro campo que sea relevante para tu respuesta
//   };
// });

//     // 🚨 Verificar valores antes de responder
//     if (!clientes || !Array.isArray(clientes)) {
//       console.warn("⚠️ No se encontraron clientes. Enviando array vacío.");
//       return NextResponse.json({ clientes: [], total: 0 });
//     }

//     return NextResponse.json({ clientes: payload, total: totalClientes });
//   } catch (error) {
//     console.error("❌ Error en el try-catch:", error);
//     return NextResponse.json(
//       { error: "Error al obtener clientes", message: error.message || "Error desconocido" },
//       { status: 500 }
//     );
//   }
// }
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    // Paginación
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const pageSize = Math.max(parseInt(searchParams.get("pageSize") || "10", 10), 1);
    const skip = (page - 1) * pageSize;

    // Orden fijo (si luego quieres sortModel lo añadimos)
    const orderBy = "fecha_ultima_interaccion_bot";
    const order = "desc";

    // Filtros
    const search = (searchParams.get("search") || "").trim();
    const estado = searchParams.get("estado");                   // "Duda resuelta" | "Todos"
    const bound = searchParams.get("bound");                     // "INBOUND" | "OUTBOUND" | "Todos"
    const interaccionBot = searchParams.get("interaccionBot");   // "Con interacción" | "Sin interacción" | "Todos"
    const accionComercial = searchParams.get("accionComercial"); // "Promesa de pago" | "Sin accion comercial" | "Todos"
    const gestor = searchParams.get("gestor");
    const role = searchParams.get("role");

    // Fechas
    const fechaInicioRaw = searchParams.get("fechaInicio");
    const fechaFinRaw = searchParams.get("fechaFin");
    const fechaRegistroRaw = searchParams.get("fechaRegistro");

    const toDate = (v) => (v && v !== "null" && v !== "" ? new Date(v) : undefined);
    const fechaInicio = toDate(fechaInicioRaw);
    const fechaFin = toDate(fechaFinRaw);

    const filtros = {};

    // Búsqueda libre
    if (search) {
      filtros.OR = [
        { nombre: { contains: search, mode: "insensitive" } },
        { apellido: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { celular: { contains: search, mode: "insensitive" } },
        { documento_identidad: { contains: search, mode: "insensitive" } },
      ];
    }

    // Estado
    if (estado && estado !== "Todos") {
      filtros.estado = estado;
    }

    // Bound (NO lo conviertas a boolean)
    if (bound && bound !== "Todos") {
      filtros.bound = bound; // "INBOUND" | "OUTBOUND"
    }

    // Rango fechas de interacción
    if (fechaInicio && fechaFin) {
      filtros.fecha_ultima_interaccion_bot = { gte: fechaInicio, lte: fechaFin };
    }

    // Mes de registro (acepta yyyy-mm o fecha completa)
    if (fechaRegistroRaw && fechaRegistroRaw !== "null" && fechaRegistroRaw !== "") {
      const base = /^\d{4}-\d{2}$/.test(fechaRegistroRaw)
        ? new Date(`${fechaRegistroRaw}-01`)
        : new Date(fechaRegistroRaw);
      const desde = new Date(base.getFullYear(), base.getMonth(), 1, 0, 0, 0, 0);
      const hasta = new Date(base.getFullYear(), base.getMonth() + 1, 0, 23, 59, 59, 999);
      filtros.fecha_creacion = { gte: desde, lte: hasta };
    }

    // Gestor (si el rol es Usuario)
    if (gestor && gestor !== "Todos" && role === "Usuario") {
      filtros.gestor = gestor; // o gestor_id si tu modelo lo usa
    }

    // Interacción con bot (sin pisar un 'estado' explícito ya seteado)
    if (interaccionBot && interaccionBot !== "Todos") {
      if (interaccionBot === "Con interacción") {
        filtros.estado = filtros.estado ?? { not: null };
      } else if (interaccionBot === "Sin interacción") {
        filtros.estado = null;
      }
    }

    // Acciones comerciales: usa relación some/none
    // if (accionComercial && accionComercial !== "Todos") {
    //   if (accionComercial === "Sin accion comercial") {
    //     filtros.accion_comercial = { none: {} };
    //   } else {
    //     filtros.accion_comercial = { some: { estado: accionComercial } };
    //   }
    // }
    // --- FILTRO POR "ÚLTIMA" ACCIÓN COMERCIAL ---
    if (accionComercial && accionComercial !== "Todos") {
      if (accionComercial === "Sin accion comercial") {
        // clientes sin ninguna acción
        filtros.accion_comercial = { none: {} };
      } else {
        // 1) hallamos la última fecha_accion por cliente
        const ultimasPorCliente = await prisma.accion_comercial.groupBy({
          by: ["cliente_id"],
          _max: { fecha_accion: true },
        });

        if (ultimasPorCliente.length === 0) {
          // no hay acciones en absoluto -> fuerza un IN vacío para devolver cero
          filtros.cliente_id = { in: [-1] };
        } else {
          // 2) traemos SOLO las acciones que coinciden con (cliente_id, max(fecha_accion)) y el estado requerido
          const ultimasCoinciden = await prisma.accion_comercial.findMany({
            where: {
              OR: ultimasPorCliente.map((g) => ({
                cliente_id: g.cliente_id,
                fecha_accion: g._max.fecha_accion,
                estado: accionComercial,
              })),
            },
            select: { cliente_id: true },
          });

          const ids = ultimasCoinciden.map((a) => a.cliente_id);
          // 3) aplicamos el filtro final a clientes
          filtros.cliente_id = ids.length ? { in: ids } : { in: [-1] }; // vacío => no resultados
        }
      }
    }

    const [clientes, totalClientes] = await Promise.all([
      prisma.cliente.findMany({
        where: filtros,
        orderBy: { [orderBy]: order },
        take: pageSize,
        skip,
        include: {
          accion_comercial: {          //ajusta el nombre de la relación si difiere
            select: { estado: true, fecha_accion: true },
            orderBy: { fecha_accion: "desc" }, // o created_at, según tu modelo
            take: 1,
          },
        },
      }),
      prisma.cliente.count({ where: filtros }),
    ]);

    // Payload robusto
    const payload = clientes.map((c) => ({
      ...c,
      id: c.cliente_id ?? c.id, // evita undefined
      fecha_creacion: c.fecha_creacion?.toISOString() ?? null,
      fecha_ultima_interaccion_bot: c.fecha_ultima_interaccion_bot?.toISOString() ?? null,
      nombre_completo: [c.nombre, c.apellido].filter(Boolean).join(" "),
      estado_asesor: c.accion_comercial?.[0]?.estado ?? null,
    }));

    return NextResponse.json({ clientes: payload, total: totalClientes });
  } catch (error) {
    console.error("❌ Error /api/clientes:", error);
    return NextResponse.json(
      { error: "Error al obtener clientes", message: error.message || "Error desconocido" },
      { status: 500 }
    );
  }
}
