"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchClienteById } from "../../../../services/clientesService";
import { Container, Typography, Button } from "@mui/material";
import { useParams } from "next/navigation"; // 🔹 Importa `useParams`

export default function ClienteDetallePage({ params }) {
    const { id } = useParams(); // 🔹 Extrae el `id` correctamente
    const [cliente, setCliente] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const loadCliente = async () => {
            const data = await fetchClienteById(id);
            setCliente(data);
        };
        loadCliente();
    }, [id]);

    if (!cliente) return <p>Cargando...</p>;

    return (
        <Container>
            <Typography variant="h4" gutterBottom sx={{ color: "#1A202C" }}>
                Detalle del Cliente
            </Typography>
            <Typography gutterBottom sx={{ color: "#1A202C" }}><strong>Nombre:</strong> {cliente.nombre}</Typography>
            <Typography gutterBottom sx={{ color: "#1A202C" }}><strong>Teléfono:</strong> {cliente.telefono}</Typography>
            <Typography gutterBottom sx={{ color: "#1A202C" }}><strong>Estado:</strong> {cliente.estado}</Typography>
            <Typography gutterBottom sx={{ color: "#1A202C" }}><strong>Gestor:</strong> {cliente.gestor}</Typography>
            <Typography gutterBottom sx={{ color: "#1A202C" }}><strong>Bound:</strong> {cliente.bound}</Typography>
            <Button variant="contained" onClick={() => router.push("/clientes")}>
                Volver a Clientes
            </Button>
        </Container>
    );
}
