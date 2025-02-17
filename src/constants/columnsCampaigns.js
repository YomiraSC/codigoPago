import EditIcon from "@mui/icons-material/Edit";
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
];
