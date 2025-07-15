// POST → crea campaña + registro en campanha_temporal
// GET  → lista todos los envíos (con su campaña y template)
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const registros = await prisma.campanha_temporal.findMany({
    include: {
      campanha: {
        include: { template: true },
      },
    },
    orderBy: { id: "desc" },
  });
  return NextResponse.json(registros);
}

export async function POST(req) {
  const { celular, template_id } = await req.json();

  // 1) crear campaña “envío personalizado”
  const campaign = await prisma.campanha.create({
    data: {
      nombre_campanha: `Envío a ${celular}`,
      descripcion: "Envío directo único",
      template_id,
    },
  });

  // 2) crear registro en temporal
  const temporal = await prisma.campanha_temporal.create({
    data: {
      campanha_id: campaign.campanha_id,
      celular,
    },
  });

  return NextResponse.json({ campaign, temporal });
}
