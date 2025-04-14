import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parse } from "csv-parse/sync";
import * as XLSX from "xlsx";
//import { MongoClient } from "mongodb";
require("dotenv").config();


// const uri = process.env.DATABASE_URL_MONGODB;
// const clientPromise = new MongoClient(uri).connect();

//CARRGANDO Y GUARDANDO EN CAMPAGNA CLIENTE   
// export async function POST(req, context) { 
    
//     try{
//         // let pagination = { page: 1, pageSize: 10 };

//         // //const { params } = context;
//         // const params = await context.params;
//         // if (!params || !params.id) {
//         //     console.error("❌ Error: ID de campaña no válido");
//         //     return NextResponse.json({ error: "ID de campaña no válido" }, { status: 400 });
//         // }
//         // const campanhaId = Number(params.id);
//         // if (isNaN(campanhaId)) {
//         //     console.error("❌ Error: El ID de la campaña no es un número válido");
//         //     return NextResponse.json({ error: "El ID de la campaña no es un número válido" }, { status: 400 });
//         // }
//         // console.log(`✅ ID de campaña recibido: ${campanhaId}`);
//         // const formData = await req.formData();
//         // const file = formData.get("archivo");

//         // if (!file) {
//         //     console.error("❌ Error: No se proporcionó ningún archivo");
//         //     return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 });
//         // }
//         console.log("📌 Iniciando carga de clientes...");
  
//         //const { params } = context;
//         const params = await context.params;
//         if (!params || !params.id) {
//           console.error("❌ Error: ID de campaña no válido");
//           return NextResponse.json({ error: "ID de campaña no válido" }, { status: 400 });
//         }
    
//         const campanhaId = Number(params.id);
//         if (isNaN(campanhaId)) {
//           console.error("❌ Error: El ID de la campaña no es un número válido");
//           return NextResponse.json({ error: "El ID de la campaña no es un número válido" }, { status: 400 });
//         }
    
//         console.log(`✅ ID de campaña recibido: ${campanhaId}`);
    
//         const formData = await req.formData();
//         const file = formData.get("archivo");
    
//         if (!file) {
//           console.error("❌ Error: No se proporcionó ningún archivo");
//           return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 });
//         }
    
//         console.log(`📌 Archivo recibido: ${file.name}`);
//         try {
//             const buffer = Buffer.from(await file.arrayBuffer());
//             let clientes = [];
      
//             if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
//               const workbook = XLSX.read(buffer, { type: "buffer" });
//               const sheetName = workbook.SheetNames[0];
//               const sheet = workbook.Sheets[sheetName];
//               clientes = XLSX.utils.sheet_to_json(sheet);
//             } else {
//               return NextResponse.json({ error: "Formato de archivo no válido. Debe ser .xlsx o .csv" }, { status: 400 });
//             }
      
//             if (clientes.length === 0) {
//               return NextResponse.json({ error: "El archivo está vacío o no tiene formato válido" }, { status: 400 });
//             }
      
//             const clientesProcesados = [];
      
//             const promises = clientes.map(async cliente => {
//               let { Numero, Nombre} = cliente;
//               if (!Numero || !Nombre) {
//                 console.warn("❗ Cliente omitido por datos faltantes:", cliente);
//                 return;
//               }
      
//               Numero = String(Numero).trim();
//               if (!Numero.startsWith("+51")) {
//                 Numero = `+51${Numero}`;
//               }
      
//               // Buscar cliente en Prisma (MySQL)
//               let clienteExistente = await prisma.cliente.findFirst({
//                 where: { celular: Numero },
//               });
      
//               // Si no existe, crearlo
//               if (!clienteExistente) {
//                 try {
//                   clienteExistente = await prisma.cliente.create({
//                     data: {
//                       celular: Numero,
//                       nombre: Nombre,
//                       documento_identidad: "",
//                       tipo_documento: "Desconocido",
//                       estado: "en seguimiento",
//                       //gestor: Asesor,
//                     },
//                   });
//                 } catch (err) {
//                   console.error("❌ Error al crear cliente en MySQL:", err);
//                   return;
//                 }
//               }
      
//               // Asociar cliente a campaña si no está
//               const clienteCampanhaExistente = await prisma.cliente_campanha.findFirst({
//                 where: {
//                   cliente_id: clienteExistente.cliente_id,
//                   campanha_id: campanhaId,
//                 },
//               });
      
//               if (!clienteCampanhaExistente) {
//                 try {
//                   await prisma.cliente_campanha.create({
//                     data: {
//                       cliente_id: clienteExistente.cliente_id,
//                       campanha_id: campanhaId,
//                     },
//                   });
//                 } catch (err) {
//                   console.error("❌ Error al agregar cliente a campaña:", err);
//                   return;
//                 }
//               }
      
//               clientesProcesados.push({
//                 cliente_id: clienteExistente.cliente_id,
//                 nombre: clienteExistente.nombre,
//                 celular: clienteExistente.celular
//                 //gestor: clienteExistente.gestor
//               });
//             });
      
//             //await Promise.all(promises);
      
//             return NextResponse.json({
//               message: `Clientes procesados con éxito en la campaña ${campanhaId}`,
//               clientes: clientesProcesados,
//             });
//           //   const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"; 
//           //   const res = await fetch(`${baseUrl}/api/clientesRiesgo?page=${pagination.page}&pageSize=${pagination.pageSize}`);

//           //   const { clientes, total } = await res.json();
            
//           //   console.log("Clientes recibidos cargar-clientes:", clientes, "Total:", total);
//           //   let clientesAgregados = [];
//           //   for (const cliente of clientes) {    
//           //       let clienteCampanhaExistente = await prisma.cliente_campanha.findFirst({
//           //           where: {
//           //               cliente_id: cliente.cliente_id,
//           //               campanha_id: campanhaId,
//           //           },
//           //       });
    
//           //       if (!clienteCampanhaExistente) {
//           //           console.log(`🔹 Cliente ${cliente.cliente_id} no está en la campaña, agregando...`);
//           //           try {
//           //               const nuevoCliente = await prisma.cliente_campanha.create({
//           //                   data: {
//           //                       cliente_id: cliente.cliente_id,
//           //                       campanha_id: campanhaId,
//           //                   },
//           //               });
//           //               clientesAgregados.push(nuevoCliente);
//           //               console.log(`✅ Cliente ${cliente.cliente_id} agregado a campaña ${campanhaId}`);
//           //           } catch (err) {
//           //               console.error("❌ Error al agregar cliente a campaña:", err);
//           //               continue;
//           //           }
//           //       } else {
//           //           console.log(`⚠️ Cliente ${cliente.cliente_id} ya está en la campaña, omitiendo...`);
//           //       }
//           //       // clientesProcesados.push({
//           //       //     cliente_id: clienteId,
//           //       //     nombre: clienteExistente.nombre,
//           //       //     celular: clienteExistente.celular,
//           //       // });
//           //   }
//           //   return NextResponse.json({
//           //     message: "Clientes agregados a la campaña exitosamente",
//           //     clientesAgregados,
//           // });
//         } catch (error) {
//             console.error("❌ Error al obtener clientes en riesgo:", error);
//         } 

        
//     } catch (error) {
//         console.error("❌ Error al cargar clientes:", error);
//         return NextResponse.json({ error: "Error al procesar el archivo" }, { status: 500 });
//     }
// }
export async function POST(req, context) { 
  try {
    const params = await context.params;
    const campanhaId = Number(params.id);
    if (isNaN(campanhaId)) {
      console.error("❌ Error: ID de campaña no válido");
      return NextResponse.json({ error: "ID de campaña no válido" }, { status: 400 });
    }
    
    const formData = await req.formData();
    const file = formData.get("archivo");
    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 });
    }
    
    const buffer = Buffer.from(await file.arrayBuffer());
    let clientes = [];
    
    // Soporta archivos Excel (xls, xlsx)
    if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      clientes = XLSX.utils.sheet_to_json(sheet);
    } else {
      return NextResponse.json({ error: "Formato de archivo no válido. Debe ser .xlsx o .xls" }, { status: 400 });
    }
    
    if (clientes.length === 0) {
      return NextResponse.json({ error: "El archivo está vacío o no tiene formato válido" }, { status: 400 });
    }
    
    const clientesProcesados = [];
    
    // Insertar cada fila en la tabla temporal campaña
    // Se usa un bucle for para ejecutar las inserciones de manera secuencial.
    // (Si el volumen es muy alto, se podría transformar a paralelismo controlado con Promise.all y p-limit).
    for (const fila of clientes) {
      let { Numero, Nombre } = fila;
      if (!Numero || !Nombre) {
        console.warn("❗ Se omite fila por datos faltantes:", fila);
        continue;
      }
      
      // Formatear el número (agregar prefijo +51 si no lo tiene)
      Numero = String(Numero).trim();
      if (!Numero.startsWith("+51")) {
        Numero = `+51${Numero}`;
      }
      
      // Insertar en la tabla temporal
      try {
        const registro = await prisma.campanha_temporal.create({
          data: {
            campanha_id: campanhaId,
            celular: Numero,
            nombre: Nombre,
          },
        });
        clientesProcesados.push(registro);
      } catch (err) {
        console.error("❌ Error al insertar registro en campañaTemporal:", err);
        // Puedes decidir si continuar o detener la carga
      }
    }
    
    return NextResponse.json({
      message: `Clientes cargados con éxito para la campaña ${campanhaId}`,
      clientes: clientesProcesados,
    });
    
  } catch (error) {
    console.error("❌ Error al cargar clientes desde Excel:", error);
    return NextResponse.json({ error: "Error al procesar el archivo" }, { status: 500 });
  }
}