"use client";

import { useState } from "react";
import {
    Box,
    Button,
    Typography,
    MenuItem,
    Select,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from "@mui/material";
import CustomDataGrid from "../components/CustomDataGrid";
import { useRouter } from "next/navigation";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";

const CampaignsPage = () => {
    const router = useRouter();
    const [campaigns, setCampaigns] = useState([
        {
            id: 24,
            nombre: "1002-Seguimiento",
            descripcion: "Campaña para los de seguimiento",
            fechaCreacion: "10/2/2025, 15:12:24",
            estado: "activa",
            tipo: "out",
            fechaInicio: "10/2/2025, 15:12:24",
            fechaFin: "N/A",
        },
        {
            id: 23,
            nombre: "Campaña prueba 2 - envíos PRP",
            descripcion: "Promo PRP Gratis",
            fechaCreacion: "31/1/2025, 16:47:56",
            estado: "activa",
            tipo: "out",
            fechaInicio: "31/1/2025, 16:47:56",
            fechaFin: "N/A",
        },
        {
            id: 22,
            nombre: "Campaña de prueba - envíos 1",
            descripcion: "Descripción prueba con envíos",
            fechaCreacion: "31/1/2025, 14:55:08",
            estado: "activa",
            tipo: "out",
            fechaInicio: "31/1/2025, 14:55:08",
            fechaFin: "N/A",
        },
    ]);

    const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
    const [sortModel, setSortModel] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState(null);

    const handleEdit = (campaign) => {
        setSelectedCampaign(campaign);
        setOpenModal(true);
    };

    const handleClose = () => {
        setOpenModal(false);
        setSelectedCampaign(null);
    };

    const columns = [
        { field: "id", headerName: "ID", width: 80 },
        { field: "nombre", headerName: "Nombre", width: 200 },
        { field: "descripcion", headerName: "Descripción", width: 250 },
        { field: "fechaCreacion", headerName: "Fecha creación", width: 200 },
        { field: "estado", headerName: "Estado", width: 100 },
        { field: "tipo", headerName: "Tipo", width: 80 },
        { field: "fechaInicio", headerName: "Fecha inicio", width: 200 },
        { field: "fechaFin", headerName: "Fecha fin", width: 100 },
        {
            field: "acciones",
            headerName: "Acciones",
            width: 150,
            renderCell: (params) => (
                <>
                    <EditIcon
                        onClick={() => handleEdit(params.row)}
                        sx={{ cursor: "pointer", color: "#1976d2", marginRight: 2 }}
                    />
                    <VisibilityIcon
                        onClick={() => router.push(`/campaigns/view/${params.row.id}`)}
                        sx={{ cursor: "pointer", color: "#1976d2" }}
                    />
                </>
            ),
        },
    ];

    return (
        <Box p={3} width="100%" maxWidth="1200px" margin="auto">
            <Typography variant="h4" gutterBottom sx={{ color: "#1A202C" }}>
                Campañas
            </Typography>      <Box display="flex" justifyContent="space-between" my={2}>
                <Button variant="contained" color="primary">+ NUEVA CAMPAÑA</Button>
                <Select defaultValue="Todas">
                    <MenuItem value="Todas">Todas</MenuItem>
                    <MenuItem value="Activas">Activas</MenuItem>
                    <MenuItem value="Finalizadas">Finalizadas</MenuItem>
                </Select>
            </Box>
            <Box width="100%" maxWidth="100%">
                <CustomDataGrid
                    rows={campaigns}
                    columns={columns}
                    totalRows={campaigns.length}
                    pagination={pagination}
                    setPagination={setPagination}
                    sortModel={sortModel}
                    setSortModel={setSortModel}
                    autoWidth
                />
            </Box>

            <Dialog open={openModal} onClose={handleClose}>
                <DialogTitle>Editar campaña</DialogTitle>
                <DialogContent>
                    <TextField label="Nombre de campaña" fullWidth margin="dense" value={selectedCampaign?.nombre || ''} />
                    <TextField label="Descripción" fullWidth margin="dense" value={selectedCampaign?.descripcion || ''} />
                    <TextField label="Estado" fullWidth margin="dense" value={selectedCampaign?.estado || ''} />
                    <TextField label="Mensaje a cliente" fullWidth margin="dense" />
                    <TextField label="Número de clientes" fullWidth margin="dense" value={selectedCampaign?.clientes || ''} />
                    <TextField label="Fecha inicio" fullWidth margin="dense" value={selectedCampaign?.fechaInicio || ''} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">Cerrar</Button>
                    <Button color="primary" variant="contained">Guardar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CampaignsPage;
