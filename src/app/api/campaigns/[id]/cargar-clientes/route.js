import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parse } from "csv-parse/sync";
import * as XLSX from "xlsx";
import { MongoClient } from "mongodb";
require("dotenv").config();


// const uri = process.env.DATABASE_URL_MONGODB;
// const clientPromise = new MongoClient(uri).connect();

   
export async function POST(req, context) { 
    
    try{
        let pagination = { page: 1, pageSize: 10 };

        //const { params } = context;
        const params = await context.params;
        if (!params || !params.id) {
            console.error("❌ Error: ID de campaña no válido");
            return NextResponse.json({ error: "ID de campaña no válido" }, { status: 400 });
        }
        const campanhaId = Number(params.id);
        if (isNaN(campanhaId)) {
            console.error("❌ Error: El ID de la campaña no es un número válido");
            return NextResponse.json({ error: "El ID de la campaña no es un número válido" }, { status: 400 });
        }
        console.log(`✅ ID de campaña recibido: ${campanhaId}`);
        // const formData = await req.formData();
        // const file = formData.get("archivo");

        // if (!file) {
        //     console.error("❌ Error: No se proporcionó ningún archivo");
        //     return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 });
        // }

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"; 
            const res = await fetch(`${baseUrl}/api/clientesRiesgo?page=${pagination.page}&pageSize=${pagination.pageSize}`);

            const { clientes, total } = await res.json();
            
            console.log("Clientes recibidos:", clientes, "Total:", total);
            for (const cliente of clientes) {    
                let clienteCampanhaExistente = await prisma.cliente_campanha.findFirst({
                    where: {
                        cliente_id: cliente.cliente_id,
                        campanha_id: campanhaId,
                    },
                });
    
                if (!clienteCampanhaExistente) {
                    console.log(`🔹 Cliente ${cliente.cliente_id} no está en la campaña, agregando...`);
                    try {
                        await prisma.cliente_campanha.create({
                            data: {
                                cliente_id: cliente.cliente_id,
                                campanha_id: campanhaId,
                            },
                        });
                        console.log(`✅ Cliente ${cliente.cliente_id} agregado a campaña ${campanhaId}`);
                    } catch (err) {
                        console.error("❌ Error al agregar cliente a campaña:", err);
                        continue;
                    }
                } else {
                    console.log(`⚠️ Cliente ${cliente.cliente_id} ya está en la campaña, omitiendo...`);
                }
    
                // clientesProcesados.push({
                //     cliente_id: clienteId,
                //     nombre: clienteExistente.nombre,
                //     celular: clienteExistente.celular,
                // });
            }
            //setClientesRiesgo(clientes);
            //setCR(total);
          } catch (error) {
            console.error("❌ Error al obtener clientes en riesgo:", error);
        } 

        
    } catch (error) {
        console.error("❌ Error al cargar clientes:", error);
        return NextResponse.json({ error: "Error al procesar el archivo" }, { status: 500 });
    }
}
// 🔹 Obtener clientes de una campaña
export async function GET(req, { params }) {
    try {
      const clientes = await prisma.cliente_campanha.findMany({
        where: { campanha_id: parseInt(params.id) },
        include: { cliente: true },
      });
  
      return NextResponse.json(clientes);
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  
  // 🔹 Eliminar cliente de campaña
  export async function DELETE(req, { params }) {
    try {   
      const { cliente_id } = await req.json();
      await prisma.cliente_campanha.deleteMany({
        where: { campanha_id: parseInt(params.id), cliente_id },
      });
  
      return NextResponse.json({ message: "Cliente eliminado" });
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }