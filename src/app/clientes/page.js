"use client";

import { useState } from "react";
import TablitaGenerica from "../components/TablitaGenerica";
import { Button } from "@mui/material";
const clientesDummy = [
  { cliente_id: 1, nombre: "Juan Pérez", email: "juan.perez@example.com", estado: "Activo" },
  { cliente_id: 2, nombre: "María González", email: "maria.gonzalez@example.com", estado: "Inactivo" },
  { cliente_id: 3, nombre: "Carlos Ramírez", email: "carlos.ramirez@example.com", estado: "Activo" },
  { cliente_id: 4, nombre: "Ana López", email: "ana.lopez@example.com", estado: "Activo" },
  { cliente_id: 5, nombre: "Pedro Torres", email: "pedro.torres@example.com", estado: "Inactivo" },
  { cliente_id: 6, nombre: "Sofía Díaz", email: "sofia.diaz@example.com", estado: "Activo" },
  { cliente_id: 7, nombre: "Luis Mendoza", email: "luis.mendoza@example.com", estado: "Activo" },
  { cliente_id: 8, nombre: "Elena Rojas", email: "elena.rojas@example.com", estado: "Inactivo" },
  { cliente_id: 9, nombre: "Gabriel Sánchez", email: "gabriel.sanchez@example.com", estado: "Activo" },
  { cliente_id: 10, nombre: "Laura Castillo", email: "laura.castillo@example.com", estado: "Inactivo" },
  { cliente_id: 11, nombre: "Manuel Herrera", email: "manuel.herrera@example.com", estado: "Activo" },
  { cliente_id: 12, nombre: "Patricia Núñez", email: "patricia.nunez@example.com", estado: "Inactivo" },
  { cliente_id: 13, nombre: "Javier Morales", email: "javier.morales@example.com", estado: "Activo" },
  { cliente_id: 14, nombre: "Carmen Ruiz", email: "carmen.ruiz@example.com", estado: "Inactivo" },
  { cliente_id: 15, nombre: "Francisco Vega", email: "francisco.vega@example.com", estado: "Activo" }
];

export default function ClientesPage() {
  // 🔹 Datos dummy (simulando datos que vendrían del backend)
  

  // 🔹 Estados para la paginación (simulados)
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const totalClientes = clientesDummy.length; // Simulamos el total

  return (
    <main>
      <h1>Clientes (Datos Dummy)</h1>

      <TablitaGenerica
        data={clientesDummy} // Pasamos los datos dummy a la tabla
        columns={[
          { key: "nombre", label: "Nombre Completo" },
          { key: "email", label: "Correo Electrónico" },
          { key: "estado", label: "Estado" },
          {
            key: "acciones",
            label: "Acciones",
            render: (cliente) => (
              <Button
                variant="contained"
                color="primary"
                onClick={() => alert(`Ver datos de ${cliente.nombre}`)}
              >
                Ver
              </Button>
            ),
          },
        ]}
        totalRows={totalClientes} // Simulamos el total
        page={currentPage}
        rowsPerPage={pageSize}
        onPageChange={(event, newPage) => setCurrentPage(newPage)}
        onRowsPerPageChange={(event) => {
          setPageSize(parseInt(event.target.value, 10));
          setCurrentPage(0);
        }}
      />
    </main>
  );
}
