import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const orderBy = searchParams.get("orderBy") || "fecha_creacion";
    const order = searchParams.get("order") || "asc";
    const search = searchParams.get("search") || "";
    const estado = searchParams.get("estado");
    const bound = searchParams.get("bound");
    let fechaInicio = searchParams.get("fechaInicio");
    let fechaFin = searchParams.get("fechaFin");

    console.log("🔎 Parámetros recibidos:", { page, pageSize, search, estado, bound, fechaInicio, fechaFin, orderBy, order });

    // 🛠️ Validar fechas (evitar null)
    fechaInicio = fechaInicio && fechaInicio !== "null" ? new Date(fechaInicio) : undefined;
    fechaFin = fechaFin && fechaFin !== "null" ? new Date(fechaFin) : undefined;

    console.log("📌 Fechas después de validación:", { fechaInicio, fechaFin });

    // 🛠️ Construcción de filtros dinámicos
    let filtros = {};

    if (search) {
      filtros.OR = [
        { nombre: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (estado && estado !== "Todos") {
      filtros.estado = estado;
    }

    if (bound && bound !== "Todos") {
      filtros.bound = bound === "INBOUND";
    }

    if (fechaInicio && fechaFin) {
      filtros.fecha_creacion = {
        gte: fechaInicio, // Mayor o igual a la fecha de inicio
        lte: fechaFin, // Menor o igual a la fecha de fin
      };
    }

    console.log("📌 Filtros aplicados:", filtros);

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
            fecha_asignacion: true,
          }
        }
      }
    });

    const clientesTransformados = clientes.map(cliente => {
      
      const codigoPago = cliente.codigo_pago.length > 0 ? cliente.codigo_pago[0] : {};  
      return {
        ...cliente,
        tipo_codigo: codigoPago.tipo_codigo || null,
        codigo_pago: codigoPago.codigo || null,
        activo: codigoPago.activo ? "Activo" : "Vencido", 
        fecha_asignacion: new Date(codigoPago.fecha_asignacion).toISOString().split('T')[0],
      };
    });
    
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
