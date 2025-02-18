import { Button, Menu, MenuItem, IconButton, Chip } from "@mui/material";
import { useState } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useRouter } from "next/navigation";
import ActionButton from "@/app/components/ActionButton";
// 🔹 Función para estilizar etiquetas de estado
const getEstadoStyle = (estado) => {
  const styles = {
    "Interesado": { 
      color: "rgba(255, 152, 0, 0.9)", // Naranja intenso
      backgroundColor: "rgba(255, 235, 59, 0.3)", // Amarillo claro
      fontWeight: "normal" 
    },
    "En seguimiento": { 
      color: "rgba(33, 150, 243, 0.9)", // Azul intenso
      backgroundColor: "rgba(33, 150, 243, 0.3)", // Azul claro
      fontWeight: "normal" 
    },
    "No interesado": { 
      color: "rgba(244, 67, 54, 0.9)", // Rojo intenso
      backgroundColor: "rgba(244, 67, 54, 0.3)", // Rojo claro
      fontWeight: "normal" 
    },
    "Promesa de Pago": { 
      color: "rgba(255, 152, 0, 0.9)", // Naranja intenso
      backgroundColor: "rgba(255, 152, 0, 0.3)", // Naranja claro
      fontWeight: "normal" 
    },
    "Finalizado": { 
      color: "rgba(76, 175, 80, 0.9)", // Verde intenso
      backgroundColor: "rgba(76, 175, 80, 0.3)", // Verde claro
      fontWeight: "normal" 
    },
  };

  return styles[estado] || { 
    color: "rgba(224, 224, 224, 0.9)", // Gris intenso
    backgroundColor: "rgba(224, 224, 224, 0.3)", // Gris claro
    fontWeight: "normal" 
  };
};

const getMotivoStyle = (motivo) => {
  const styles = {
    "Mala información": { 
      color: "rgba(255, 152, 0, 0.9)", // Naranja intenso
      backgroundColor: "rgba(255, 235, 59, 0.3)", // Amarillo claro
      fontWeight: "normal" 
    },
    "Administrativo": { 
      color: "rgba(33, 150, 243, 0.9)", // Azul intenso
      backgroundColor: "rgba(33, 150, 243, 0.3)", // Azul claro
      fontWeight: "normal" 
    },
    "Olvido de pago": { 
      color: "rgba(244, 67, 54, 0.9)", // Rojo intenso
      backgroundColor: "rgba(244, 67, 54, 0.3)", // Rojo claro
      fontWeight: "normal" 
    },
    "Desconocido": { 
      color: "rgba(255, 152, 0, 0.9)", // Naranja intenso
      backgroundColor: "rgba(255, 152, 0, 0.3)", // Naranja claro
      fontWeight: "normal" 
    },
    "Económico": { 
      color: "rgba(76, 175, 80, 0.9)", // Verde intenso
      backgroundColor: "rgba(76, 175, 80, 0.3)", // Verde claro
      fontWeight: "normal" 
    },
  };

  return styles[motivo] || { 
    color: "rgba(224, 224, 224, 0.9)", // Gris intenso
    backgroundColor: "rgba(224, 224, 224, 0.3)", // Gris claro
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
  {
    field: "motivo",
    headerName: "Motivo",
    flex: 1,
    minWidth: 100,
    renderCell: (params) => (
      <Chip
        label={params.value}
        sx={{
          color: getMotivoStyle(params.value).color,
          backgroundColor: getMotivoStyle(params.value).backgroundColor,
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
  },*/
  /*
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
