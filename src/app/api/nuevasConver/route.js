import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
//import bigquery from "@/lib/bigquery";





export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const orderBy = searchParams.get("orderBy") || "creado_en";
    const order = searchParams.get("order") || "asc";
    const search = searchParams.get("search") || "";
    const activo = searchParams.get("activo");
    const tipoCod = searchParams.get("tipoCod");
    const bound = searchParams.get("bound");
    let fechaInicio = searchParams.get("fechaInicio");
    let fechaFin = searchParams.get("fechaFin");

    console.log("🔎 Parámetros recibidos:", { page, pageSize, search, activo, tipoCod, bound, fechaInicio, fechaFin, orderBy, order });

    // 🛠️ Validar fechas (evitar null)
    // fechaInicio = fechaInicio && fechaInicio !== "null" ? new Date(fechaInicio) : undefined;
    // fechaFin = fechaFin && fechaFin !== "null" ? new Date(fechaFin) : undefined;

    console.log("📌 Fechas después de validación:", { fechaInicio, fechaFin });

    // 🛠️ Construcción de filtros dinámicos
    let filtrosNuevos = {};

    if (search) {
      /* filtros.OR = [
        { nombre: { contains: search, mode: "insensitive" } },
        { documento_identidad: { contains: search, mode: "insensitive" } },
      ]; */
      const searchLower = search.toLowerCase();
  
      filtrosNuevos.OR = [
        { nombre: { contains: search } },
        { celular: { contains: search} },
      ];
    }

    

    console.log("📌 Filtros aplicados a nuevos:", filtrosNuevos);

    const clientesNC = await prisma.campanha_temporal.findMany({
      where: filtrosNuevos,
      distinct: ['celular'],
      orderBy: { [orderBy]: order },
      take: pageSize,
      skip: (page - 1) * pageSize,
      select: {
        nombre: true,
        celular: true,
      }
    });

    console.log(clientesNC);

    console.log("✅ Clientes obtenidos nuevos:", clientesNC.length);
    //console.log("🕵️‍♂️ Filtros usados:", filtros);

    // 🛠️ Obtener total de clientes
    // ✔️ asume que `filtros` es algo como { campaña_id: 3, activo: true, … }
    const gruposNC = await prisma.campanha_temporal.groupBy({
        by:    ['celular'],
        where: filtrosNuevos
      });
    const totalClientes = gruposNC.length;
  

    // 🚨 Verificar valores antes de responder
    if (!clientesNC || !Array.isArray(clientesNC)) {
      console.warn("⚠️ No se encontraron clientes. Enviando array vacío.");
      return NextResponse.json({ clientesNC: [], total: 0 });
    }

    return NextResponse.json({
        clientes: clientesNC.map(cliente => ({
          ...cliente,
          c_cel: cliente.celular, 
        })), total: totalClientes });
  } catch (error) {
    console.error("❌ Error en el try-catch:", error);

    return NextResponse.json(
      { error: "Error al obtener clientes", message: error.message || "Error desconocido" },
      { status: 500 }
    );
  }
}
