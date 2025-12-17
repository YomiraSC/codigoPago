import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";
import client from "@/lib/twilio";


export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const pageSize = parseInt(searchParams.get("pageSize") || "10");

        // 🔹 Obtener campañas con paginación
        const campaigns = await prisma.campanha.findMany({
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: { template: true },
            orderBy: { fecha_creacion: "desc" }
        });
        console.log("ZZXFA",campaigns);

        // 🔹 Validar si `campaigns` es `null` o `undefined`
        if (!campaigns) {
            return NextResponse.json({ campaigns: [], totalCount: 0 });
        }

        // 🔹 Contar total de campañas
        const totalCount = await prisma.campanha.count();

        return NextResponse.json({
            campaigns: campaigns.map(campaign => ({
                ...campaign,
                fecha_creacion: campaign.fecha_creacion.toISOString().split("T")[0] // Extrae solo la fecha
            })),
            totalCount
        });
    } catch (error) {
        console.error("Error al obtener campañas:", error);
        return NextResponse.json({ error: "Error al obtener campañas" }, { status: 500 });
    }
}

// 📌 Crear campaña
export async function POST(req) {
    try {
        const { nombre_campanha, descripcion, template_id, fecha_fin } = await req.json();
        console.log("Campaña",nombre_campanha,descripcion,template_id,fecha_fin);
        const campanha = await prisma.campanha.create({
            data: { nombre_campanha, descripcion, template_id : null, fecha_fin: new Date(fecha_fin) , variable_mappings: { "1": "nombre" },
        estado_campanha: "Activo" },
        });
        
        return NextResponse.json({ message: "Campaña creada con éxito", campanha });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error al crear la campaña" }, { status: 500 });
    }
}

// 📌 Cargar clientes a la campaña
export async function PATCH(req) {
    try {
        const { id } = req.query;
        const formData = await req.formData();
        const file = formData.get("archivo");

        if (!file) return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 });

        const filePath = path.join(process.cwd(), "uploads", file.name);
        await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

        // 🚀 Leer archivo Excel y agregar clientes
        const clientesData = [{ nombre: "Juan", celular: "123456789" }]; // (Simulado)

        for (const cliente of clientesData) {
            const clienteExistente = await prisma.cliente.findUnique({
                where: { celular: cliente.celular },
            });

            const cliente_id = clienteExistente
                ? clienteExistente.cliente_id
                : (await prisma.cliente.create({ data: cliente })).cliente_id;

            await prisma.cliente_campanha.create({ data: { cliente_id, campanha_id: parseInt(id) } });
        }

        return NextResponse.json({ message: "Clientes agregados" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error al cargar clientes" }, { status: 500 });
    }
}

// 📌 Enviar campaña
export async function PUT(req) {
    try {
        const { id } = req.query;
        const campanha = await prisma.campanha.findUnique({
            where: { campanha_id: parseInt(id) },
            include: { cliente_campanha: { include: { cliente: true } }, template: true },
        });

        if (!campanha) return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
        const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
        
        if (!twilioPhone) {
            console.error("❌ TWILIO_PHONE_NUMBER no está definido en .env.local");
            return NextResponse.json({ 
                error: "Configuración de Twilio incompleta" 
            }, { status: 500 });
        }
        for (const clienteCampanha of campanha.cliente_campanha) {
            await client.messages.create({
                from: `whatsapp:${twilioPhone}`,
                to: `whatsapp:${clienteCampanha.cliente.celular}`,
                body: campanha.mensaje_cliente,
            });
        }

        return NextResponse.json({ message: "Mensajes enviados" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error al enviar la campaña" }, { status: 500 });
    }
}

// 📌 Eliminar campaña
export async function DELETE(req) {
    try {
        const { id } = req.query;

        await prisma.cliente_campanha.deleteMany({ where: { campanha_id: parseInt(id) } });
        await prisma.campanha.delete({ where: { campanha_id: parseInt(id) } });

        return NextResponse.json({ message: "Campaña eliminada" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error al eliminar la campaña" }, { status: 500 });
    }
}