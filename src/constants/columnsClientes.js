import { Button, Chip } from "@mui/material";

// 🔹 Función para estilizar etiquetas de estado
const getEstadoStyle = (estado) => {
  const styles = {
    "Activo": { color: "white", backgroundColor: "#4CAF50" },
    "Interesado": { color: "black", backgroundColor: "#FFEB3B" },
    "Interesado con Reservas": { color: "white", backgroundColor: "#F44336" },
    "Seguimiento": { color: "white", backgroundColor: "#2196F3" },
    "Promesa de pago": { color: "black", backgroundColor: "#FF9800" },
    "Cita Agendada": { color: "white", backgroundColor: "#9C27B0" },
  };
  return styles[estado] || { color: "black", backgroundColor: "#E0E0E0" }; // Default gris
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
  },

  { field: "gestor", headerName: "Gestor", flex: 1, minWidth: 150 },

  {
    field: "acciones",
    headerName: "Acciones",
    flex: 1,
    minWidth: 100,
    sortable: false,
    renderCell: (params) => (
      <Button
        variant="contained"
        size="small"
        color="primary"
        onClick={() => alert(`Ver datos de ${params.row.nombre}`)}
      >
        Ver
      </Button>
    ),
  },
];
