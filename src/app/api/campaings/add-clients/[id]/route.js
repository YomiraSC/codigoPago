import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Agregar clientes a una campaña existente
export async function POST(req, context) {
  try {
    const params = await context.params;
    const campanhaId = Number(params.id);

    if (isNaN(campanhaId)) {
      return NextResponse.json(
        { error: "ID de campaña no válido" },
        { status: 400 }
      );
    }

    const { clientIds, clients } = await req.json();

    // Verificar que la campaña existe
    const campanha = await prisma.campanha.findUnique({
      where: { campanha_id: campanhaId },
    });

    if (!campanha) {
      return NextResponse.json(
        { error: "Campaña no encontrada" },
        { status: 404 }
      );
    }

    let dataToInsert = [];

    // Si se envían clientIds (IDs de clientes existentes)
    if (clientIds && Array.isArray(clientIds) && clientIds.length > 0) {
      // Obtener información de los clientes
      const clientes = await prisma.cliente.findMany({
        where: { cliente_id: { in: clientIds } },
      });

      dataToInsert = clientes.map((cliente) => ({
        campanha_id: campanhaId,
        celular: cliente.celular,
        nombre: cliente.nombre || null,
      }));
    }
    // Si se envían clientes completos (desde BigQuery)
    else if (clients && Array.isArray(clients) && clients.length > 0) {
      dataToInsert = clients.map((cliente) => {
        let celular = cliente.celular || cliente.telefono || "";
        if (celular && !celular.startsWith("+51")) {
          celular = celular.replace(/\s+/g, "").trim();
          if (!celular.startsWith("+")) {
            celular = `+51${celular}`;
          }
        }

        return {
          campanha_id: campanhaId,
          celular: celular,
          nombre: cliente.nombre || cliente.Nombre || null,
        };
      });
    } else {
      return NextResponse.json(
        { error: "No se proporcionaron clientes para agregar" },
        { status: 400 }
      );
    }

    if (dataToInsert.length === 0) {
      return NextResponse.json(
        { error: "No hay datos válidos para insertar" },
        { status: 400 }
      );
    }

    // Guardar clientes en campanha_temporal
    const result = await prisma.campanha_temporal.createMany({
      data: dataToInsert,
      skipDuplicates: true,
    });

    // Actualizar el contador de clientes en la campaña
    const totalClientes = await prisma.campanha_temporal.count({
      where: { campanha_id: campanhaId },
    });

    await prisma.campanha.update({
      where: { campanha_id: campanhaId },
      data: { num_clientes: totalClientes },
    });

    return NextResponse.json({
      message: "Clientes agregados exitosamente",
      clientes_agregados: result.count,
      total_clientes: totalClientes,
    });
  } catch (error) {
    console.error("❌ Error al agregar clientes a la campaña:", error);
    return NextResponse.json(
      {
        error: "Error al agregar clientes a la campaña",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

