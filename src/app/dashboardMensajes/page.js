"use client";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const actualizarYObtenerStats = async () => {
      try {
        // Paso 1: actualizar estados en Twilio
        await fetch("/api/dashboard/actualizar");

        // Paso 2: obtener métricas del dashboard actualizadas
        const res = await fetch("/api/dashboardMensajes");
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      }
    };

    actualizarYObtenerStats();
  }, []);

  if (!stats) {
    return <div className="p-6">Cargando métricas del dashboard...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard - Envío de Campañas</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Total de clientes" value={stats.total} />
        <Card title="% Enviados" value={stats.porcentajeEnviados.toFixed(1) + "%"} />
        <Card title="% Leídos" value={stats.porcentajeLeidos.toFixed(1) + "%"} />
        <Card title="% Fallidos" value={stats.porcentajeFallidos.toFixed(1) + "%"} />
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="border rounded-xl p-4 shadow bg-white">
      <h2 className="text-lg font-medium">{title}</h2>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}
