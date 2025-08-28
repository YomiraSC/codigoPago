import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
  const gestor = searchParams.get('gestor'); // Username del gestor
  const fechaDesde = searchParams.get('fechaDesde');
  const fechaHasta = searchParams.get('fechaHasta');
  const tipoEntrega = searchParams.get('tipoEntrega') || 'todos';

    // 📅 Validación de fechas requeridas
    if (!fechaDesde || !fechaHasta) {
      return NextResponse.json(
        { error: "Debe proporcionar fecha de inicio y fin" },
        { status: 400 }
      );
    }

    // Filtros para acciones comerciales (asesor)
    const filtroBase = {
      fecha_accion: {
        gte: new Date(fechaDesde),
        lte: new Date(fechaHasta + 'T23:59:59.999Z'),
      },
    };
    // Filtros para historico_estado (bot)
    const filtroHistorico = {
      fecha_estado: {
        gte: new Date(fechaDesde),
        lte: new Date(fechaHasta + 'T23:59:59.999Z'),
      },
      estado: {
        in: [
          'Duda resuelta',
          'Duda no resuelta',
          'Codigo entregado',
          'Codigo no entregado'
        ]
      }
    };
    // console.log("🔄 Filtro base:", gestor);
    // const gestorCon = await prisma.usuario.findUnique({
    //   where: { usuario_id: parseInt(gestor) },
    //   select: { username: true }
    // });
    // // 👤 Agregar filtro por gestor si se especifica
    // if (gestor && gestor !== 'todos' && gestor !== '') {
    //   // Filtrar por el campo gestor que contiene el username
       
    //   console.log(`Filtrando por gestor: ${gestorCon.username}`);

    //   filtroBase.gestor = gestorCon.username; // Asumiendo que el campo es 'username'
    // }
    console.log("🔄 Filtro base - gestor recibido:", gestor);

    let usernameFiltro = null;
    if (gestor && gestor !== 'todos' && gestor.trim() !== '') {
      const idNum = Number(gestor);
      if (Number.isInteger(idNum) && Number.isFinite(idNum)) {
        const gestorCon = await prisma.usuario.findUnique({
          where: { usuario_id: idNum },
          select: { username: true }
        });
        if (!gestorCon) {
          return NextResponse.json(
            { error: `No se encontró usuario con id ${idNum}` },
            { status: 404 }
          );
        }
        usernameFiltro = gestorCon.username;
      } else {
        usernameFiltro = gestor;
      }
    }
    if (usernameFiltro && tipoEntrega === 'asesor') {
      filtroBase.gestor = usernameFiltro;
    }


    // 📊 Obtener estadísticas principales según tipoEntrega
    let totalLlamadas = 0;
    let llamadasHoy = 0;
    let accionesPorEstado = [];
    let actividadDiaria = [];
    let clientesContactados = 0;
    let totalBot = 0;
    let botPorEstado = [];
    let botActividadDiaria = [];
    let botClientesContactados = 0;

    // Acciones comerciales (asesor)
    if (tipoEntrega === 'asesor' || tipoEntrega === 'todos') {
      [
        totalLlamadas,
        llamadasHoy,
        accionesPorEstado,
        actividadDiaria,
        clientesContactados
      ] = await Promise.all([
        prisma.accion_comercial.count({ where: filtroBase }),
        prisma.accion_comercial.count({
          where: {
            ...filtroBase,
            fecha_accion: {
              gte: new Date(new Date().toISOString().split('T')[0]),
              lte: new Date(),
            }
          }
        }),
        prisma.accion_comercial.groupBy({
          by: ['estado'],
          _count: { accion_comercial_id: true },
          where: filtroBase,
        }),
        prisma.accion_comercial.groupBy({
          by: ['fecha_accion'],
          _count: { accion_comercial_id: true },
          where: {
            ...filtroBase,
            fecha_accion: {
              gte: new Date(Math.max(new Date(fechaDesde), new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))),
              lte: new Date(fechaHasta + 'T23:59:59.999Z'),
            }
          },
          orderBy: { fecha_accion: 'asc' },
        }),
        prisma.accion_comercial.groupBy({
          by: ['cliente_id'],
          where: filtroBase,
        }).then(grouped => grouped.length)
      ])
    }

    // Estados del bot (historico_estado)
    if (tipoEntrega === 'bot' || tipoEntrega === 'todos') {
      // Total de códigos entregados por bot (historico_estado)
      const historicoEstados = await prisma.historico_estado.findMany({
        where: filtroHistorico,
        select: {
          estado: true,
          fecha_estado: true,
          cliente_id: true
        }
      });
      totalBot = historicoEstados.length;
      // Agrupar por estado
      const estadoCount = {};
      historicoEstados.forEach(h => {
        estadoCount[h.estado] = (estadoCount[h.estado] || 0) + 1;
      });
      botPorEstado = Object.entries(estadoCount).map(([estado, count]) => ({
        estado,
        _count: { historico_estado_id: count }
      }));
      // Agrupar por día
      const actividad = {};
      historicoEstados.forEach(h => {
        const fecha = h.fecha_estado.toISOString().split('T')[0];
        actividad[fecha] = (actividad[fecha] || 0) + 1;
      });
      botActividadDiaria = Object.entries(actividad).map(([fecha, cantidad]) => ({
        fecha_accion: new Date(fecha),
        _count: { historico_estado_id: cantidad }
      }));
      // Clientes únicos
      botClientesContactados = new Set(historicoEstados.map(h => h.cliente_id)).size;
    }

    // � Calcular métricas derivadas
    // Sumar totales según tipoEntrega
    let totalFinal = 0;
    let llamadasHoyFinal = 0;
    let accionesPorEstadoFinal = [];
    let actividadDiariaFinal = [];
    let clientesContactadosFinal = 0;

    if (tipoEntrega === 'bot') {
      totalFinal = totalBot;
      llamadasHoyFinal = 0; // Opcional: puedes calcular los del día si lo necesitas
      accionesPorEstadoFinal = botPorEstado.map(item => ({
        estado: item.estado,
        _count: { accion_comercial_id: item._count.historico_estado_id }
      }));
      actividadDiariaFinal = botActividadDiaria.map(item => ({
        fecha: item.fecha_accion.toISOString().split('T')[0],
        cantidad: item._count.historico_estado_id
      }));
      clientesContactadosFinal = botClientesContactados;
    } else if (tipoEntrega === 'asesor') {
      totalFinal = totalLlamadas;
      llamadasHoyFinal = llamadasHoy;
      accionesPorEstadoFinal = accionesPorEstado;
      actividadDiariaFinal = actividadDiaria.map(item => ({
        fecha: item.fecha_accion.toISOString().split('T')[0],
        cantidad: item._count.accion_comercial_id
      }));
      clientesContactadosFinal = clientesContactados;
    } else {
      // todos: sumar ambos
      totalFinal = totalLlamadas + totalBot;
      llamadasHoyFinal = llamadasHoy; // solo asesor, o puedes sumar ambos si lo calculas para bot
      // Unir por estado
      const estadoMap = {};
      accionesPorEstado.forEach(item => {
        estadoMap[item.estado] = (estadoMap[item.estado] || 0) + item._count.accion_comercial_id;
      });
      botPorEstado.forEach(item => {
        estadoMap[item.estado] = (estadoMap[item.estado] || 0) + item._count.historico_estado_id;
      });
      accionesPorEstadoFinal = Object.entries(estadoMap).map(([estado, count]) => ({
        estado,
        _count: { accion_comercial_id: count }
      }));
      // Unir actividad diaria
      const actividadMap = {};
      actividadDiaria.forEach(item => {
        const fecha = item.fecha_accion.toISOString().split('T')[0];
        actividadMap[fecha] = (actividadMap[fecha] || 0) + item._count.accion_comercial_id;
      });
      botActividadDiaria.forEach(item => {
        const fecha = item.fecha_accion.toISOString().split('T')[0];
        actividadMap[fecha] = (actividadMap[fecha] || 0) + item._count.historico_estado_id;
      });
      actividadDiariaFinal = Object.entries(actividadMap).map(([fecha, cantidad]) => ({ fecha, cantidad }));
      // Unir clientes contactados
      clientesContactadosFinal = clientesContactados + botClientesContactados;
    }

    // Calcular promedios y métricas
    const promedioLlamadasDia = totalFinal > 0 ? Math.round(totalFinal / 30) : 0;
    const totalClientesEnPeriodo = await prisma.cliente.count({
      where: {
        fecha_creacion: {
          gte: new Date(fechaDesde),
          lte: new Date(fechaHasta + 'T23:59:59.999Z'),
        }
      }
    });
    const porcentajeContactabilidad = totalClientesEnPeriodo > 0 ?
      Math.round((clientesContactadosFinal / totalClientesEnPeriodo) * 100) : 0;
    // Efectividad y conversión (solo para asesor y todos)
    const estadosPositivos = [
      'Promesa de Pago',
      'Seguimiento - Duda resuelta',
      'Duda resuelta'
    ];
    const accionesPositivas = accionesPorEstadoFinal.reduce((acc, item) => {
      if (estadosPositivos.includes(item.estado || '')) {
        return acc + item._count.accion_comercial_id;
      }
      return acc;
    }, 0);
    const porcentajeEfectividad = totalFinal > 0 ?
      Math.round((accionesPositivas / totalFinal) * 100) : 0;
    // Conversión: clientes que llegaron a estados de éxito total
    const estadosExitosos = ['Promesa de Pago', 'Codigo entregado'];
    const accionesExitosas = accionesPorEstadoFinal.reduce((acc, item) => {
      if (estadosExitosos.includes(item.estado || '')) {
        return acc + item._count.accion_comercial_id;
      }
      return acc;
    }, 0);
    const porcentajeConversion = totalFinal > 0 ?
      Math.round((accionesExitosas / totalFinal) * 100) : 0;
    // Distribución de estados
    const distribucionEstados = {
      'Promesa de Pago': accionesPorEstadoFinal.find(item => item.estado === 'Promesa de Pago')?._count.accion_comercial_id || 0,
      'Duda resuelta': accionesPorEstadoFinal.find(item => item.estado === 'Duda resuelta')?._count.accion_comercial_id || 0,
      'Duda no resuelta': accionesPorEstadoFinal.find(item => item.estado === 'Duda no resuelta')?._count.accion_comercial_id || 0,
      'Codigo entregado': accionesPorEstadoFinal.find(item => item.estado === 'Codigo entregado')?._count.accion_comercial_id || 0,
      'Codigo no entregado': accionesPorEstadoFinal.find(item => item.estado === 'Codigo no entregado')?._count.accion_comercial_id || 0,
    };
    // Tipos de acción
    const tiposAccion = accionesPorEstadoFinal.reduce((acc, item) => {
      acc[item.estado || 'Sin especificar'] = item._count.accion_comercial_id;
      return acc;
    }, {});
    // Actividad diaria
    const actividadDiariaFormateada = actividadDiariaFinal;

    // 🎯 Respuesta estructurada
    const estadisticas = {
      // Métricas principales (adaptadas para el dashboard)
      totalLlamadas: totalFinal, // Total de acciones comerciales + bot
      llamadasHoy: llamadasHoyFinal,
      llamadasMes: totalFinal, // En el rango seleccionado
      promedioLlamadasDia,
      tendencia: `${porcentajeContactabilidad >= 70 ? '+' : ''}${porcentajeContactabilidad}%`,
      clientesContactados: clientesContactadosFinal,
      porcentajeContactabilidad,
      porcentajeEfectividad,
      porcentajeConversion,
      distribucionEstados,
      tiposAccion,
      actividadDiaria: actividadDiariaFormateada,
      resultados: [
        { name: 'Promesa de Pago', value: distribucionEstados['Promesa de Pago'] || 0, color: '#00C49F' },
        { name: 'Duda resuelta', value: distribucionEstados['Duda resuelta'] || 0, color: '#0088FE' },
        { name: 'Duda no resuelta', value: distribucionEstados['Duda no resuelta'] || 0, color: '#FFA726' },
        { name: 'Codigo entregado', value: distribucionEstados['Codigo entregado'] || 0, color: '#4caf50' },
        { name: 'Codigo no entregado', value: distribucionEstados['Codigo no entregado'] || 0, color: '#f44336' },
      ].filter(item => item.value > 0),
      tendenciaSemanal: actividadDiariaFormateada.slice(-7).map((item, index) => ({
        dia: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][new Date(item.fecha).getDay()],
        llamadas: item.cantidad
      })),
      gestores: [],
      filtros: {
        gestor: gestor || 'todos',
        fechaDesde,
        fechaHasta,
        totalAcciones: totalFinal,
        totalClientesEnPeriodo,
      },
    };

    return NextResponse.json(estadisticas);

  } catch (error) {
    console.error("❌ Error al obtener estadísticas del asesor:", error);
    return NextResponse.json(
      { 
        error: "Error al obtener estadísticas", 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
