import { NextResponse } from "next/server";
import bigquery_peak from "@/lib/bigquery_peak";

export async function POST(request) {
  try {
    const { telefono } = await request.json();

    // Validar que se proporcione el teléfono
    if (!telefono) {
      return NextResponse.json({
        success: false,
        error: "El teléfono es requerido para la búsqueda"
      }, { status: 400 });
    }

    console.log('🔍 Buscando cliente en BigQuery con teléfono:', telefono);

    // Limpiar el número de teléfono (quitar caracteres no numéricos)
    const telefonoLimpio = telefono.replace(/\D/g, '');
    
    // Construir la consulta SQL simplificada - Solo BOT_codpago_MES
    const query = `
      SELECT 
        telefono,
        nombre,
        DNI,
        segmentacion,
        Gestion
      FROM \`BOT_codpago.BOT_codpago_MES\`
      WHERE telefono = @telefono
      LIMIT 5
    `;

    console.log('📝 Consulta SQL:', query);
    console.log('📞 Teléfono limpio para búsqueda:', telefonoLimpio);

    // Configurar opciones de la consulta
    const options = {
      query: query,
      location: 'US',
      params: {
        telefono: telefonoLimpio
      }
    };

    // Ejecutar la consulta usando bigquery_peak
    const [rows] = await bigquery_peak.query(options);

    console.log(`✅ BigQuery ejecutado. Resultados encontrados: ${rows.length}`);

    // Procesar los resultados simplificados
    const clientesEncontrados = rows.map(row => {
      return {
        // Información básica del BOT
        telefono: row.telefono,
        nombre: row.nombre,
        documento: row.DNI,
        
        // Información de gestión (LO IMPORTANTE)
        segmentacion: row.segmentacion,
        gestion: row.Gestion, // convencional o retadora
        
        // Para compatibilidad con el frontend
        nombre_completo: row.nombre,
        telefono_principal: row.telefono,
        celular: row.telefono,
        email: null,
        
        // Datos originales para referencia
        datos_originales: row
      };
    });

    if (clientesEncontrados.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No se encontraron clientes con ese número de teléfono",
        clientes: [],
        total: 0
      });
    }

    console.log(`📊 Clientes procesados: ${clientesEncontrados.length}`);

    return NextResponse.json({
      success: true,
      message: `Se encontraron ${clientesEncontrados.length} cliente(s)`,
      clientes: clientesEncontrados,
      total: clientesEncontrados.length,
      telefono_buscado: telefonoLimpio
    });

  } catch (error) {
    console.error('❌ Error en búsqueda de cliente BigQuery:', error);
    
    // Manejo específico de errores de BigQuery
    if (error.code === 'ENOENT') {
      return NextResponse.json({
        success: false,
        error: "Error de configuración de BigQuery - archivo de credenciales no encontrado"
      }, { status: 500 });
    }
    
    if (error.message?.includes('not found')) {
      return NextResponse.json({
        success: false,
        error: "Tabla o dataset no encontrado en BigQuery"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: false,
      error: "Error interno del servidor",
      details: error.message
    }, { status: 500 });
  }
}

// Método GET para pruebas (opcional)
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "API de búsqueda de gestión de clientes en BigQuery",
    usage: "POST con { telefono: 'numero_telefono' }",
    tables_used: [
      "BOT_codpago.BOT_codpago_MES - Solo gestión y segmentación"
    ],
    fields_available: [
      "telefono", "nombre", "DNI", "segmentacion", "Gestion (convencional/retadora)"
    ],
    purpose: "Determinar tipo de gestión para envío de mensajes"
  });
}
