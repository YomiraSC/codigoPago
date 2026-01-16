import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";

// Configuración para evitar pre-renderizado
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function POST(req, context) {
  try {
    // Validación de contexto
    if (!context?.params) {
      return NextResponse.json({ error: "Contexto no válido" }, { status: 400 });
    }
    
    const params = await context.params;
    const campanhaId = Number(params?.id);
    
    if (isNaN(campanhaId)) {
      return NextResponse.json({ error: "ID de campaña no válido" }, { status: 400 });
    }
    
    // Obtener archivo
    const formData = await req.formData();
    const file = formData.get("archivo");
    
    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 });
    }
    
    // Procesar archivo Excel
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
    
    if (!Array.isArray(clientes) || clientes.length === 0) {
      return NextResponse.json({ error: "Archivo vacío" }, { status: 400 });
    }
    
    // Procesar clientes con validación robusta
    const dataToInsert = [];
    
    for (let i = 0; i < clientes.length; i++) {
      const fila = clientes[i];
      
      // Saltar filas vacías o sin datos
      if (!fila || typeof fila !== 'object') continue;
      
      const numero = fila.Numero;
      const nombre = fila.Nombre;
      
      // Validar que existan los campos
      if (numero == null || numero === '' || nombre == null || nombre === '') {
        continue;
      }
      
      // Convertir a string de forma segura
      let numeroStr;
      let nombreStr;
      
      try {
        numeroStr = String(numero).trim();
        nombreStr = String(nombre).trim();
      } catch (e) {
        console.warn(`Error procesando fila ${i}:`, e);
        continue;
      }
      
      // Verificar que no estén vacíos después del trim
      if (!numeroStr || !nombreStr) continue;
      
      // Agregar código de país de forma segura
      let celular = numeroStr;
      try {
        if (typeof numeroStr === 'string' && numeroStr.length > 0) {
          celular = numeroStr.indexOf('+51') === 0 ? numeroStr : `+51${numeroStr}`;
        }
      } catch (e) {
        console.warn(`Error procesando número en fila ${i}:`, e);
        celular = `+51${numeroStr}`;
      }
      
      dataToInsert.push({
        campanha_id: campanhaId,
        celular: celular,
        nombre: nombreStr,
      });
    }
    
    if (dataToInsert.length === 0) {
      return NextResponse.json({ 
        error: "No hay datos válidos para insertar" 
      }, { status: 400 });
    }
    
    // Insertar en base de datos
    const result = await prisma.campanha_temporal.createMany({
      data: dataToInsert,
      skipDuplicates: true,
    });
    
    return NextResponse.json({
      message: `Clientes cargados exitosamente`,
      cantidadInsertados: result.count,
      cantidadProcesados: clientes.length
    });
    
  } catch (error) {
    console.error("Error en cargar-clientes:", error);
    return NextResponse.json({ 
      error: "Error al procesar archivo",
      detalle: error.message 
    }, { status: 500 });
  }
}