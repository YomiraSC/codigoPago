import { Button, Menu, MenuItem, IconButton, Chip } from "@mui/material";
import { useState } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useRouter } from "next/navigation";
import ActionButton from "@/app/components/ActionButton";
// 🔹 Función para estilizar etiquetas de estado
const getEstadoStyle = (estado) => {
    const styles = {
      "Activo": { 
        color: "rgba(76, 175, 80, 0.9)", // Verde más intenso
        backgroundColor: "rgba(76, 175, 80, 0.3)", // Verde con opacidad
        fontWeight: "normal" 
      },
      "Interesado": { 
        color: "rgba(255, 152, 0, 0.9)", // Amarillo más intenso
        backgroundColor: "rgba(255, 235, 59, 0.3)",
        fontWeight: "normal" 
      },
      "Interesado con Reservas": { 
        color: "rgba(244, 67, 54, 0.9)", // Rojo más intenso
        backgroundColor: "rgba(244, 67, 54, 0.3)",
        fontWeight: "normal" 
      },
      "Seguimiento": { 
        color: "rgba(33, 150, 243, 0.9)", // Azul más intenso
        backgroundColor: "rgba(33, 150, 243, 0.3)",
        fontWeight: "normal" 
      },
      "Promesa de pago": { 
        color: "rgba(255, 152, 0, 0.9)", // Naranja más intenso
        backgroundColor: "rgba(255, 152, 0, 0.3)",
        fontWeight: "normal" 
      },
      "Cita Agendada": { 
        color: "rgba(156, 39, 176, 0.9)", // Morado más intenso
        backgroundColor: "rgba(156, 39, 176, 0.3)",
        fontWeight: "normal" 
      },
    };
  
    return styles[estado] || { 
      color: "rgba(224, 224, 224, 0.9)", // Gris más intenso
      backgroundColor: "rgba(224, 224, 224, 0.3)", 
      fontWeight: "normal" 
    };
  };
  
  

export const columnsClientes = [
  { field: "nombre", headerName: "Nombre", flex: 1, minWidth: 150 },
  { field: "telefono", headerName: "Teléfono", flex: 1, minWidth: 120 },

  {
    field: "estado",
    headerName: "Estado",
    flex: 1,
    minWidth: 120,
    renderCell: (params) => (
      <Chip
        label={params.value}
        sx={{
          color: getEstadoStyle(params.value).color,
          backgroundColor: getEstadoStyle(params.value).backgroundColor,
          fontWeight: "bold",
        }}
      />
    ),
  },

  /*{
    field: "score",
    headerName: "Score",
    flex: 1,
    minWidth: 100,
    renderCell: (params) => (
      <Chip
        label={params.value}
        sx={{
          backgroundColor: "#FFEB3B",
          color: "black",
          fontWeight: "bold",
        }}
      />
    ),
  },

  {
    field: "bound",
    headerName: "Bound",
    flex: 1,
    minWidth: 100,
    renderCell: (params) => (
      <span style={{ fontWeight: "bold", color: params.value === "INBOUND" ? "#2E7D32" : "#D32F2F" }}>
        {params.value}
      </span>
    ),
  },*/

  { field: "gestor", headerName: "Gestor", flex: 1, minWidth: 150 },

  {
    field: "acciones",
    headerName: "Acciones",
    flex: 1,
    renderCell: (params) => {
      const router = useRouter();

      return (
        <ActionButton
          options={[
            { label: "Acción Comercial", action: () => console.log("Acción Comercial") },
            { label: "Ver Conversación", action: () => console.log("Ver Conversación") },
            { label: "Ver Detalle", action: () => router.push(`/clientes/${params.row.id}`) },
          ]}
        />
      );
    },
  },
];
