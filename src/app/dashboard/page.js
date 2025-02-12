"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axiosInstance from "../../../services/api";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Estado de sesión:", status);
    console.log("Datos de sesión al cargar:", session);

    if (status === "authenticated") {
      obtenerClientes();
    }
  }, [status, session]);

  const obtenerClientes = async () => {
    try {
      const res = await axiosInstance.get("/clientes");
      console.log("Clientes obtenidos:", res.data);
      setClientes(res.data);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) return <p>Cargando...</p>;
  if (status === "unauthenticated") return <p>No tienes acceso. <a href="/">Iniciar sesión</a></p>;

  return (
    <div>
      <h1>Bienvenido, {session?.user?.name}</h1>
      <p>Tu rol es: {session?.user?.role}</p>

      <h2>Lista de Clientes:</h2>
      <ul>
        {clientes.map(cliente => (
          <li key={cliente.cliente_id}>{cliente.nombre} - {cliente.email}</li>
        ))}
      </ul>
    </div>
  );
}
