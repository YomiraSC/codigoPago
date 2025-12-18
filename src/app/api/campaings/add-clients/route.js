import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const {
      nombre_campanha,
      descripcion,
      template_id,
      fecha_inicio,
      fecha_fin,
      clients,
      variableMappings,
      filters, // Filtros aplicados para guardar
    } = await req.json();

    // Validar que haya clientes
    if (!clients || clients.length === 0) {
      return NextResponse.json(
        { error: "No hay clientes para agregar a la campaña" },
        { status: 400 }
      );
    }

    // 1. Crear la campaña
    const campanha = await prisma.campanha.create({
      data: {
        nombre_campanha,
        descripcion: descripcion || "Sin descripción",
        template_id: template_id || null,
        fecha_inicio: fecha_inicio ? new Date(fecha_inicio) : new Date(),
        fecha_fin: fecha_fin ? new Date(fecha_fin) : null,
        variable_mappings: variableMappings || {},
        filtros_aplicados: filters || {}, // Guardar los filtros aplicados
        estado_campanha: "Activo",
        num_clientes: clients.length,
      },
    });

    // 2. Preparar datos para guardar en campanha_temporal
    const dataToInsert = clients.map((cliente) => {
      // Normalizar el número de teléfono
      let celular = cliente.celular || cliente.telefono || "";
      if (celular && !celular.startsWith("+51")) {
        // Remover espacios y caracteres no numéricos excepto +
        celular = celular.replace(/\s+/g, "").trim();
        if (!celular.startsWith("+")) {
          celular = `+51${celular}`;
        }
      }

      return {
        campanha_id: campanha.campanha_id,
        celular: celular,
        nombre: cliente.nombre || cliente.Nombre || null,
      };
    });

    // 3. Guardar clientes en campanha_temporal
    const result = await prisma.campanha_temporal.createMany({
      data: dataToInsert,
      skipDuplicates: true,
    });

    console.log(
      `✅ Campaña creada: ${campanha.campanha_id} con ${result.count} clientes`
    );

    return NextResponse.json({
      message: "Campaña creada y clientes asociados exitosamente",
      campanha_id: campanha.campanha_id,
      clientes_guardados: result.count,
      campanha,
    });
  } catch (error) {
    console.error("❌ Error al crear campaña o agregar clientes:", error);
    return NextResponse.json(
      {
        error: "Error al crear la campaña o agregar los clientes",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

