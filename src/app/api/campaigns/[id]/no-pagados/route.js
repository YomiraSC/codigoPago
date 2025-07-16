import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req, { params }) {
  const { id } = await params;        // ← AQUI
  const campanhaId = Number(id);
  if (isNaN(campanhaId)) {
    return NextResponse.json({ error: "ID de campaña no válido" }, { status: 400 });
  }

  // Paginación (puedes adaptar si quieres)
  const url = new URL(req.url);
  const page     = parseInt(url.searchParams.get("page") || "1", 10);
  const pageSize = parseInt(url.searchParams.get("pageSize") || "10", 10);

  // 1) Contar los códigos pendientes
  const total = await prisma.codigo_pago.count({       // ← AJUSTA 'codigoPago' al nombre real de tu modelo
    where: { pago_realizado: false }
  });

  // 2) Traer los códigos pendientes + datos del cliente
  const rows = await prisma.codigo_pago.findMany({     // ← idem
    where: { pago_realizado: false },
    include: { cliente: true },                       // ← asume que tu relación es `cliente: Cliente`
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { id_codigo_pago: "asc" }                            // ← o el campo PK que corresponda
  }); 

  // 3) Mapear para el DataGrid
  const clientes = rows.map(cp => ({
    id: cp.id_codigo_pago,                    // id del código de pago
    cliente_id: cp.cliente.cliente_id,
    nombre:  cp.cliente.nombre,
    celular:  cp.cliente.celular,
    contrato: cp.id_contrato      // o como llames tu FK de contrato
  }));
  return NextResponse.json({
    clientes: clientes.map(c => ({
      id: c.cliente_id,
      nombre: c.nombre,
      celular: c.celular
    })),
    pagination: { total, page, pageSize }
  });
}
