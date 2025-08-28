import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
  const { tipo, cliente, template_id, variables, gestion, gestor_username } = await request.json();

    // Validar datos requeridos
    if (!cliente?.celular || !cliente?.nombre || !variables?.codigo || !gestion) {
      return NextResponse.json({ 
        error: "Faltan datos requeridos: celular, nombre, código y gestión" 
      }, { status: 400 });
    }

    // Para gestión retadora, también necesitamos template_id
    if (gestion === 'retadora' && !template_id) {
      return NextResponse.json({ 
        error: "Para gestión retadora se requiere template_id" 
      }, { status: 400 });
    }

    console.log('📧 Datos recibidos para envío individual:', {
      tipo,
      cliente: {
        celular: cliente.celular,
        nombre: cliente.nombre
      },
      template_id,
      variables,
      gestion
    });

    // 🔍 BUSCAR CLIENTE EN POSTGRESQL (con +51 agregado)
    let clientePostgres = null;
    const celularConPrefijo = `+51${cliente.celular.replace(/\D/g, '')}`;
    
    try {
      clientePostgres = await prisma.cliente.findFirst({
        where: {
          OR: [
            { celular: cliente.celular },
            { celular: celularConPrefijo },
            { celular: cliente.celular.replace(/\D/g, '') }
          ]
        }
      });
      
      if (clientePostgres) {
        console.log('✅ Cliente encontrado en PostgreSQL:', clientePostgres.cliente_id);
      } else {
        console.log('ℹ️ Cliente no encontrado en PostgreSQL');
      }
    } catch (error) {
      console.error('⚠️ Error buscando cliente en PostgreSQL:', error);
    }

    // 🎯 LÓGICA SEGÚN TIPO DE GESTIÓN
    let metaResult = null;
    let plantilla = null;
    let mensajePersonalizado = null;

    if (gestion === 'retadora') {
      // 📋 GESTIÓN RETADORA: Buscar plantilla y enviar mensaje
      plantilla = await prisma.template.findUnique({
        where: { id: parseInt(template_id) },
        select: {
          id: true,
          nombre_template: true,
          mensaje: true,
          template_content_sid: true,
          parametro: true
        }
      });

      if (!plantilla) {
        return NextResponse.json({ 
          error: "Plantilla no encontrada" 
        }, { status: 404 });
      }

      console.log('📋 Plantilla encontrada:', plantilla);

      // Preparar mensaje personalizado reemplazando variables
      mensajePersonalizado = plantilla.mensaje;
      mensajePersonalizado = mensajePersonalizado.replace(/\{\{nombre\}\}/g, cliente.nombre);
      mensajePersonalizado = mensajePersonalizado.replace(/\{\{codigo\}\}/g, variables.codigo);
      mensajePersonalizado = mensajePersonalizado.replace(/\{\{1\}\}/g, variables.codigo);

      console.log('💬 Mensaje personalizado:', mensajePersonalizado);

      // Preparar datos para envío a Meta API
      const metaApiData = {
        messaging_product: "whatsapp",
        to: cliente.celular,
        type: "template",
        template: {
          name: plantilla.nombre_template,
          language: {
            code: "es_PE"
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: variables.codigo
                }
              ]
            }
          ]
        }
      };

      console.log('🚀 Enviando a Meta API:', JSON.stringify(metaApiData, null, 2));

      // Realizar llamada a Meta API
      const metaResponse = await fetch('https://graph.facebook.com/v18.0/710553965483257/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.META_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metaApiData)
      });

      metaResult = await metaResponse.json();
      console.log('📱 Respuesta de Meta API:', metaResult);

      if (!metaResponse.ok) {
        console.error('❌ Error de Meta API:', metaResult);
        return NextResponse.json({ 
          error: `Error al enviar mensaje: ${metaResult.error?.message || 'Error desconocido'}` 
        }, { status: 500 });
      }

      // Registrar el envío en la tabla envios_directos
      try {
        const envioRecord = await prisma.envios_directos.create({
          data: {
            celular: cliente.celular,
            fecha_asociacion: new Date(),
            whatsapp_message_id: metaResult.messages?.[0]?.id || null,
            estado_mensaje: 'enviado',
            fecha_envio: new Date(),
            fecha_ultimo_estado: new Date(),
            error_code: null,
            error_descripcion: null
          }
        });

        console.log('✅ Registro creado en envios_directos:', envioRecord);
      } catch (dbError) {
        console.error('⚠️ Error al registrar en BD (pero mensaje enviado):', dbError);
      }
    }

    // 📝 REGISTRAR ACCIÓN COMERCIAL (para ambos tipos de gestión)
    try {
      const notaAccion = clientePostgres 
        ? `Código entregado: ${variables.codigo}. Cliente vinculado ID: ${clientePostgres.cliente_id}`
        : `Código entregado: ${variables.codigo}. Cliente no encontrado en BD: ${cliente.nombre} - ${cliente.celular}`;

      const estadoAccion = gestion === 'convencional' 
        ? 'Código especial entregado convencional'
        : 'Código entregado especial retadora';

        console.log('📝 Registrando acción comercial con estado:', clientePostgres);

      const accionComercial = await prisma.accion_comercial.create({
        data: {
          cliente_id: clientePostgres?.cliente_id || null,
          estado: estadoAccion,
          nota: notaAccion,
          fecha_accion: new Date(),
          gestor: gestor_username || null
        }
      });

      console.log('✅ Acción comercial registrada:', accionComercial);
    } catch (dbError) {
      console.error('⚠️ Error al registrar acción comercial:', dbError);
    }

    // 📊 RESPUESTA SEGÚN TIPO DE GESTIÓN
    if (gestion === 'convencional') {
      return NextResponse.json({
        success: true,
        message: "Acción comercial registrada exitosamente (gestión convencional)",
        data: {
          tipo_gestion: 'convencional',
          accion_registrada: 'Código especial entregado convencional',
          cliente: {
            nombre: cliente.nombre,
            celular: cliente.celular
          },
          codigo_entregado: variables.codigo,
          cliente_vinculado: clientePostgres ? {
            id: clientePostgres.cliente_id,
            nombre: clientePostgres.nombre
          } : null,
          mensaje_enviado: false
        }
      });
    } else {
      return NextResponse.json({
        success: true,
        message: "Mensaje enviado y acción comercial registrada exitosamente (gestión retadora)",
        data: {
          tipo_gestion: 'retadora',
          accion_registrada: 'Código entregado especial retadora',
          meta_message_id: metaResult.messages?.[0]?.id,
          cliente: {
            nombre: cliente.nombre,
            celular: cliente.celular
          },
          plantilla_usada: plantilla.nombre_template,
          mensaje_enviado: mensajePersonalizado,
          codigo_entregado: variables.codigo,
          cliente_vinculado: clientePostgres ? {
            id: clientePostgres.cliente_id,
            nombre: clientePostgres.nombre
          } : null
        }
      });
    }

  } catch (error) {
    console.error('❌ Error en envío individual:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor al enviar mensaje",
      details: error.message 
    }, { status: 500 });
  }
}
