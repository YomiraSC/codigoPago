/* import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";

export const CAMPAIGN_COLUMNS = (onEdit) => [
  { field: "id", headerName: "ID", width: 80 },
  { field: "nombre", headerName: "Nombre", width: 200 },
  { field: "descripcion", headerName: "Descripción", width: 250 },
  { field: "estado", headerName: "Estado", width: 100 },
  { field: "tipo", headerName: "Tipo", width: 80 },
  { field: "fechaCreacion", headerName: "Fecha creación", width: 200 },
  {
    field: "acciones",
    headerName: "Acciones",
    width: 150,
    renderCell: (params) => (
      <>
        <EditIcon onClick={() => onEdit(params.row)} sx={{ cursor: "pointer", color: "#1976d2", marginRight: 2 }} />
        <VisibilityIcon sx={{ cursor: "pointer", color: "#1976d2" }} />
      </>
    ),
  },
]; */
import ActionButton from "@/app/components/ActionButton";
import { useRouter } from "next/navigation";
import { Box } from "@mui/material";

export const CAMPAIGN_COLUMNS = (onEdit, onDelete) => [
  {
    field: "id",
    headerName: "ID",
    width: 80,
    headerClassName: "header-cell",
    cellClassName: "data-cell",
    renderCell: (params) => (
      <Box sx={{
        textAlign: 'center', 
        padding: '8px', 
        fontWeight: 'bold', 
        color: '#254e59'
      }}>
        {params.value}
      </Box>
    ),
  },
  {
    field: "nombre_campanha",
    headerName: "Nombre",
    width: 200,
    renderCell: (params) => (
      <Box sx={{
        textAlign: 'center', 
        padding: '8px', 
        color: '#333'
      }}>
        {params.value}
      </Box>
    ),
  },
  {
    field: "descripcion",
    headerName: "Descripción",
    width: 250,
    renderCell: (params) => (
      <Box sx={{
        textAlign: 'center', 
        padding: '8px', 
        color: '#333'
      }}>
        {params.value}
      </Box>
    ),
  },
  {
    field: "estado_campanha",
    headerName: "Estado",
    width: 100,
    renderCell: (params) => (
      <Box sx={{
        textAlign: 'center', 
        padding: '8px', 
        fontWeight: 'bold', 
        color: '#388e3c'
      }}>
        {params.value}
      </Box>
    ),
  },
  {
    field: "fecha_creacion",
    headerName: "Fecha creación",
    width: 200,
    renderCell: (params) => (
      <Box sx={{
        textAlign: 'center', 
        padding: '8px', 
        color: '#333'
      }}>
        {params.value}
      </Box>
    ),
  },
  {
    field: "acciones",
    headerName: "Acciones",
    width: 150,
    renderCell: (params) => {
      const router = useRouter();
      return (
        <ActionButton
          options={[
            {
              label: "Editar",
              action: () => onEdit(params.row),
              color: "#007391", // Azul claro
              sx: { 
                backgroundColor: "#007391", 
                "&:hover": { backgroundColor: "#005c6b" }, 
                color: "#fff",
                padding: "6px 12px",
                borderRadius: "4px",
                marginRight: "8px"
              },
            },
            {
              label: "Detalle",
              action: () => router.push(`/campaigns/${params.row.id}`),
              color: "#388e3c", // Verde
              sx: { 
                backgroundColor: "#388e3c", 
                "&:hover": { backgroundColor: "#00600f" }, 
                color: "#fff",
                padding: "6px 12px",
                borderRadius: "4px",
                marginRight: "8px"
              },
            },
            {
              label: "Eliminar",
              action: () => onDelete(params.row.id),
              color: "#D32F2F", // Rojo
              sx: { 
                backgroundColor: "#D32F2F", 
                "&:hover": { backgroundColor: "#9A0007" }, 
                color: "#fff",
                padding: "6px 12px",
                borderRadius: "4px"
              },
            },
          ]}
        />
      );
    },
    
  },
];
