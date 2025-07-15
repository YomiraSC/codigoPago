// src/app/personalizado/page.js
"use client";
import { useState } from "react";
import { Box, Button, Typography, CircularProgress, Alert, Snackbar } from "@mui/material";
import CustomDataGrid from "../components/CustomDataGrid";
import PersonalizadoModal from "../components/PersonalizadoModal";
import usePersonalizado from "../../hooks/usePersonalizado";

export default function PersonalizadoPage() {
  const {
    records,
    templates,
    loading,
    error,
    openModal,
    handleCreate,
    handleClose,
    handleSave,
    handleSend,
  } = usePersonalizado();

  // Estados para Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Handler que envía y muestra notificación
  const onSendClick = async (id) => {
    try {
      await handleSend(id);
      setSnackbarMessage("Mensaje enviado");
      setSnackbarSeverity("success");
    } catch (e) {
      setSnackbarMessage("Error al enviar mensaje");
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
    }
  };

  const COLUMNS = [
    { field: "id", headerName: "ID", width: 200 },
    { field: "campanha_id", headerName: "Campaña ID", width: 200 },
    { field: "celular", headerName: "Celular", width: 200 },
    // {
    //   field: "template",
    //   headerName: "Template",
    //   width: 200,
    //   valueGetter: (params) => params?.row?.campanha?.template?.nombre_template ?? "",
    // },
    { field: "estado_envio", headerName: "Estado", width: 200 },
    {
      field: "accion",
      headerName: "Enviar",
      width: 200,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => onSendClick(params.row.id)}
        >
          Enviar
        </Button>
      ),
    },
  ];

  return (
    <Box p={3} maxWidth="1200px" margin="auto">
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: "black", fontWeight: "bold", fontFamily: "'Roboto', sans-serif" }}
      >
        Envíos Directos
      </Typography>

      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="contained" onClick={handleCreate}>
          + Nuevo Envío
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <Box textAlign="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <CustomDataGrid rows={records} columns={COLUMNS} totalRows={records.length} />
      )}

      <PersonalizadoModal
        open={openModal}
        onClose={handleClose}
        templates={templates}
        onSave={handleSave}
      />

      {/* Snackbar de notificaciones abajo izquierda */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
