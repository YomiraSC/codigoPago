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

    if (search) {
      /* filtros.OR = [
        { nombre: { contains: search, mode: "insensitive" } },
        { documento_identidad: { contains: search, mode: "insensitive" } },
      ]; */
      const searchLower = search.toLowerCase();
  
      filtros.OR = [
        { nombre: { contains: searchLower } },
        { apellido: {contains: searchLower}},
        { documento_identidad: { contains: searchLower } },
      ];
    }


    if ((activo && activo !== "Todos") || (tipoCod && tipoCod !== "Todos") || (fechaInicio && fechaFin)) {
      filtros.codigo_pago = {
        some: {
          ...(activo && activo !== "Todos" && { activo: activo === "Activo" }),
          ...(tipoCod && tipoCod !== "Todos" && { tipo_codigo: tipoCod }),
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
    

    console.log("📌 Filtros aplicados:", filtros);

    const clientesRiesgo = await prisma.cliente.findMany({
      where: {
        ...filtros,
        codigo_pago: {
          some: { // Filtra clientes que tengan al menos un código con tipo "especial"
            tipo_codigo: "Recaudación",
          },
        },
      },
      
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
          orderBy: { fecha_vencimiento: "desc" }, // Ordenar por fecha de creación descendente
          select: {
            tipo_codigo: true,
            codigo: true,
            activo: true,
            id_contrato: true,
            fecha_vencimiento: true,
          }
        }
      }
    });

    const clientesTransformadosR = clientesRiesgo.map(cliente => {
      
      const codigoPago = cliente.codigo_pago.length > 0 ? cliente.codigo_pago[0] : {};  
      return {
        ...cliente,
        nombreCompleto: `${cliente.nombre} ${cliente.apellido}`, // Concatenar nombre y apellido
        tipo_codigo: codigoPago.tipo_codigo || null,
        codigo_pago: codigoPago.codigo || null,
        id_contrato: codigoPago.id_contrato || null,
        activo: codigoPago.activo ? "Activo" : "Vencido", 
        fecha_vencimiento: new Date(codigoPago.fecha_vencimiento).toISOString().split('T')[0],
      };
    });
    //console.log("Nombre completo generado:", `${cliente.nombre} ${cliente.apellido}`);

    console.log(clientesTransformadosR);

    console.log("✅ Clientes obtenidos:", clientesTransformadosR.length);
    //console.log("🕵️‍♂️ Filtros usados:", filtros);

    // 🛠️ Obtener total de clientes
    const totalClientes = await prisma.cliente.count({where: {
      ...filtros,
      codigo_pago: {
        some: { // Filtra clientes que tengan al menos un código con tipo "especial"
          tipo_codigo: "Recaudación",
        },
      },
    }});

    // 🚨 Verificar valores antes de responder
    if (!clientesRiesgo || !Array.isArray(clientesRiesgo)) {
      console.warn("⚠️ No se encontraron clientes. Enviando array vacío.");
      return NextResponse.json({ clientesRiesgo: [], total: 0 });
    }

    return NextResponse.json({
        clientes: clientesTransformadosR.map(cliente => ({
          ...cliente,
          c_id: cliente.cliente_id, // ✅ Cambiamos `cliente_id` a `id`
        })), total: totalClientes });
  } catch (error) {
    console.error("❌ Error en el try-catch:", error);

    return NextResponse.json(
      { error: "Error al obtener clientes", message: error.message || "Error desconocido" },
      { status: 500 }
    );
  }
}
