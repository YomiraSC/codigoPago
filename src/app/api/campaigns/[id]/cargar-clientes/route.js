import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req, context) {
  try {
    if (!context?.params) {
      return NextResponse.json({ error: "Contexto no válido" }, { status: 400 });
    }

    const params = await context.params;
    const campanhaId = Number(params?.id);
    
    if (isNaN(campanhaId)) {
      return NextResponse.json({ error: "ID de campaña no válido" }, { status: 400 });
    }
    
    const formData = await req.formData();
    const file = formData.get("archivo");
    
    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 });
    }
    
    const buffer = Buffer.from(await file.arrayBuffer());
    let clientes = [];
    
    if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      clientes = XLSX.utils.sheet_to_json(sheet);
    } else {
      return NextResponse.json({ error: "Formato no válido" }, { status: 400 });
    }
    
    if (clientes.length === 0) {
      return NextResponse.json({ error: "Archivo vacío" }, { status: 400 });
    }
    
    const dataToInsert = [];
    
    for (const fila of clientes) {
      const numero = fila?.Numero;
      const nombre = fila?.Nombre;
      
      if (!numero || !nombre) continue;
      
      let numeroStr = String(numero).trim();
      if (!numeroStr) continue;
      
      if (numeroStr && !numeroStr.startsWith("+51")) {
        numeroStr = `+51${numeroStr}`;
      }
      
      dataToInsert.push({
        campanha_id: campanhaId,
        celular: numeroStr,
        nombre: String(nombre).trim(),
      });
    }
    
    if (dataToInsert.length === 0) {
      return NextResponse.json({ error: "No hay datos válidos" }, { status: 400 });
    }
    
    const result = await prisma.campanha_temporal.createMany({
      data: dataToInsert,
      skipDuplicates: true,
    });
    
    return NextResponse.json({
      message: `Clientes cargados: ${result.count}`,
      cantidadInsertados: result.count,
    });
    
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error al procesar archivo" }, { status: 500 });
  }
}