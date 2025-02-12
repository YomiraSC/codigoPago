"use client";

import { DataGrid } from "@mui/x-data-grid";
import React, { useState } from "react";
import {
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Typography,
  Box,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useRouter } from "next/navigation";
import { getStateInfo } from "@/app/utils/stateMapping";
import { set } from "date-fns";
import { getScoreInfo } from "@/app/utils/scoreMapping";

export default function ClientesTable({
  data,
  totalClientes,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  setSelectedClientes,
  asesor,
  setRefresh,
  asesores,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [selectionModel, setSelectionModel] = useState([]); // Mantiene los IDs seleccionados
  const [editedData, setEditedData] = useState(null); // Datos editados del cliente
  const [notes, setNotes] = useState(""); // Notas del cambio
  const [error, setError] = useState(false); // Validación de notas
  const [commercialActionLoading, setCommercialActionLoading] = useState(false);


  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const [openConversationDialog, setOpenConversationDialog] = useState(false);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [conversationData, setConversationData] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(0);

  const [selectedDate, setSelectedDate] = useState(null);
const [selectedTime, setSelectedTime] = useState(null);

  const router = useRouter();

  const handleMenuOpen = (params, event) => {
    setSelectedRow(params.row);
    setEditedData({ ...params.row });
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action) => {
    if (action === "comercial") {
      setDialogTitle("Acción Comercial (Cliente)");
      setOpenDialog(true);
      fetchCommercialAction(selectedRow.id);
    } else if (action === "conversacion") {
      setOpenConversationDialog(true);
      fetchConversation(selectedRow.id);
    }

    handleMenuClose();
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setNotes("");
    setError(false);
    setEditedData(null);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleConversationDialogClose = () => {
    setOpenConversationDialog(false);
    setConversationData(null);
    setSelectedConversation(0);
  };

  const fetchConversation = async (clientId) => {
    setConversationLoading(true);
    try {
      const response = await fetch(`/api/dashboard/conversaciones/${clientId}`);
      if (!response.ok) {
        throw new Error("Error al cargar la conversación");
      }
      const data = await response.json();
      setConversationData(data.conversaciones);
      console.log("Conversación cargada:", data);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      setSnackbarMessage("Error al cargar la conversación");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setConversationLoading(false);
    }
  };

  const saveChanges = async () => {
    try {
      const body = JSON.stringify({
        nombreCompleto: editedData.nombreCompleto,
        email: editedData.email === "" ? null : editedData.email,
        observaciones: editedData.observaciones,
        notas: notes,
        gestor: editedData.gestor === " - " ? "" : editedData.gestor,
        asesorId: asesor.asesor_id,
        acciones: editedData.acciones,
        fechaCita: editedData.acciones === "cita_agendada" || editedData.acciones === "promesa_de_pago" ? selectedDate : null,
        horaCita: editedData.acciones === "cita_agendada" || editedData.acciones === "promesa_de_pago" ? selectedTime : null,
      });
      console.log("Body guardar:", body);
      const response = await fetch(`/api/clients/${editedData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      });

      if (!response.ok) {
        throw new Error("Error al guardar los cambios.");
      }

      const data = await response.json();
      console.log("Cambios guardados:", data);

      setRefresh();
      // Cerrar el diálogo después de guardar
      handleDialogClose();
      setSnackbarMessage("Acción comercial guardada exitosamente");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Error al guardar cambios:", error.message);
      setSnackbarMessage("Error al crear la acción comercial");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleSave = () => {
    /*
    if (!notes.trim()) {
      setError(true);
      return;
    }
    */
    // Aquí se implementaría la lógica para guardar los cambios (API o lógica adicional)
    console.log("Datos guardados:", editedData);
    console.log("Notas:", notes);
    saveChanges();
  };

  const handleInputChange = (field, value) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const columns = [
    { field: "nombreCompleto", headerName: "Nombre", flex: 1, minWidth: 150 },
    { field: "celular", headerName: "Teléfono", flex: 1, minWidth: 120 },
    { field: "estado", headerName: "Estado", flex: 1, minWidth: 100,
      renderCell: (params) => (
        <Chip
        label={getStateInfo(params.row.estado).text}
        sx={{
          backgroundColor: getStateInfo(params.row.estado).color,
          color: getStateInfo(params.row.estado).textColor,
          fontWeight: "medium",
        }}
      />
      )
     },
    { field: "score", headerName: "Score", flex: 1, minWidth: 100,
      renderCell: (params) => (
        <Chip
        label={getScoreInfo(params.row.score).text}
        sx={{
          backgroundColor: getScoreInfo(params.row.score).color,
          color: getScoreInfo(params.row.score).textColor,
          fontWeight: "medium",
        }}
      />
      )
     },
    { field: "bound", headerName: "Bound", flex: 1, minWidth: 100 },
    { field: "gestor", headerName: "Gestor", flex: 1, minWidth: 100 },
    {
      field: "actions",
      headerName: "Acciones",
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <IconButton size="small" onClick={(e) => handleMenuOpen(params, e)}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];
  console.log("DATA CLIENTES", data);
  const rows = data.map((cliente) => ({
    id: cliente.cliente_id,
    nombreCompleto: `${cliente.nombre} ${cliente.apellido || ""}`.trim(),
    email: cliente.email || "",
    celular: cliente.celular,
    estado: cliente.estado,
    bound: cliente.bound === true ? "INBOUND" : "OUTBOUND",
    fecha_creacion: cliente.fecha_creacion,
    fecha_ultima_interaccion: cliente.fecha_ultima_interaccion,
    observaciones: cliente.observaciones || "",
    gestor: cliente.gestor !== "" ? cliente.gestor : " - ",
    acciones: cliente.acciones,
    score: cliente.score,
  }));

  const handleSelectionChange = (newSelection) => {
    console.log("SELECTIONS : ", newSelection);
    setSelectionModel(newSelection); // Actualiza los seleccionados internamente
    setSelectedClientes(newSelection); // Notifica al componente principal
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleViewDetails = (id) => {
    router.push(`/clientes/${id}`); // Redirige a la página de detalles del cliente
  };

  const fetchCommercialAction = async (clientId) => {
    setCommercialActionLoading(true);
    console.log("Cliente ID:", clientId);
    try {
      // Ajusta la ruta a la que necesitas hacer el fetch
      const response = await fetch(`/api/clients/citas/${clientId}`);
      if (!response.ok) {
        throw new Error("Error al cargar la acción comercial");
      }
  
      const data = await response.json();
      console.log("Datos Acción Comercial:", data);
  
      if (data && data.fecha_cita) {
        const citaDate = new Date(data.fecha_cita);
  
        // Formatear la fecha para el input de tipo date (YYYY-MM-DD)
        const formattedDate = citaDate.toISOString().split('T')[0];
        setSelectedDate(formattedDate);
  
        // Formatear la hora para el input de tipo time (HH:MM)
        const formattedTime = citaDate.toISOString().split('T')[1].substring(0,5);
        setSelectedTime(formattedTime);
      } else {
        // Si no hay cita, limpiar los campos
        setSelectedDate(null);
        setSelectedTime(null);
      }
  
    } catch (error) {
      console.error("Error fetching commercial action:", error);
      setSnackbarMessage("Error al cargar la acción comercial");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setCommercialActionLoading(false);
    }
  };
  


  return (
    <div
      style={{
        height: 300,
        width: "100%",
        border: "1px solid #ddd",
        borderRadius: "4px",
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        paginationMode="server"
        pageSize={pageSize}
        paginationModel={{
          page: currentPage - 1, // 0-indexado
          pageSize,
        }}
        onPaginationModelChange={({ page, pageSize }) => {
          onPageChange(page + 1); // 1-indexado
          onPageSizeChange(pageSize);
        }}
        rowCount={totalClientes}
        checkboxSelection
        rowsPerPageOptions={[5, 10, 20]}
        onRowSelectionModelChange={handleSelectionChange}
        disableRowSelectionOnClick
        disableExtendRowFullWidth
        pagination
        getRowClassName={
          (params) =>
            params.row.gestor === " - "
              ? "bg-red-50" // Rojo suave si no está gestionado
              : "bg-blue-50" // Azul suave si está gestionado
        }
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleAction("comercial")}>
          Acción Comercial
        </MenuItem>
        <MenuItem onClick={() => handleViewDetails(selectedRow?.id)}>
          Ver Detalles
        </MenuItem>
        <MenuItem onClick={() => handleAction("conversacion")}>
          Ver Conversación
        </MenuItem>
        {/*<MenuItem onClick={() => handleAction('detalles')}>Ver Detalles</MenuItem>*/}
      </Menu>

      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
        {commercialActionLoading ? (
                <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 150,
                }}
              >
                <CircularProgress />
              </Box>
        ) : (
          <>
          <p>
            <strong>Usuario actual:</strong>{" "}
            {asesor.name}
          </p>
          {editedData && (
            <>
              <TextField
                fullWidth
                margin="normal"
                label="Nombre"
                value={editedData.nombreCompleto}
                onChange={(e) =>
                  handleInputChange("nombreCompleto", e.target.value)
                }
              />
              <TextField
                fullWidth
                margin="normal"
                label="Email"
                value={editedData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Teléfono"
                value={editedData.celular}
                InputProps={{ readOnly: true }} // No se puede editar el teléfono
              />
              <FormControl fullWidth variant="outlined" size="medium">
                <InputLabel htmlFor="gestor">Gestor</InputLabel>
                <Select
                  fullWidth
                  label="Gestor"
                  margin="normal"
                  value={editedData.gestor}
                  onChange={(e) => handleInputChange("gestor", e.target.value)}
                >
                  <MenuItem value=" - ">Sin gestor asignado</MenuItem>
                  {asesores.map((asesor) => (
                    <MenuItem
                      key={asesor.asesor_id}
                      value={asesor.nombre + " " + asesor.primer_apellido}
                    >
                      {asesor.nombre} {asesor.primer_apellido}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                margin="normal"
                label="Observaciones"
                value={editedData.observaciones}
                multiline
                rows={4}
                onChange={(e) =>
                  handleInputChange("observaciones", e.target.value)
                }
              />
              <FormControl fullWidth variant="outlined" size="medium">
                <InputLabel htmlFor="acciones">Acciones</InputLabel>
                <Select
                  fullWidth
                  label="Acciones"
                  margin="normal"
                  value={editedData.acciones}
                  onChange={(e) =>
                    handleInputChange("acciones", e.target.value)
                  }
                >
                  <MenuItem value="cita_agendada">Cita Agendada</MenuItem>
                  <MenuItem value="volver_contactar">
                    Volver a contactar
                  </MenuItem>
                  <MenuItem value="atendio_otro_lugar">
                    Atendió en otro lugar
                  </MenuItem>
                  <MenuItem value="no_interesado">No Interesado</MenuItem>
                  <MenuItem value="promesa_de_pago">Promesa</MenuItem>
                </Select>
              </FormControl>
              {editedData?.acciones === "promesa_de_pago" || editedData?.acciones === "cita_agendada" ? (
                <>
                  <TextField
                    width="50%"
                    margin="normal"
                    type="date"
                    label="Fecha de la cita"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                  <TextField
                    width="50%"
                    margin="normal"
                    type="time"
                    label="Hora de la cita"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  />
                </>
              ) : null}

              {/*
              <TextField
                fullWidth
                margin="normal"
                label="Notas (obligatorio)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                error={error}
                helperText={error ? "Las notas son obligatorias" : ""}
                multiline
                rows={4}
              />
              */}
               
            </>
          )}
          </>
        )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cerrar</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openConversationDialog}
        onClose={handleConversationDialogClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Conversación del Cliente</DialogTitle>
        <DialogContent>
          {conversationLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "200px",
              }}
            >
              <CircularProgress />
            </div>
          ) : conversationData ? (
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Paper elevation={2} className="p-4">
                  <Typography variant="subtitle1" gutterBottom>
                    Historial de Conversaciones
                  </Typography>
                  <List>
                    {conversationData.map((conv, index) => (
                      <ListItem
                        key={conv.conversacion_id}
                        button="true"
                        selected={selectedConversation === index}
                        onClick={() => setSelectedConversation(index)}
                      >
                        <ListItemText
                          primary={`Conversación ${index + 1}`}
                          secondary={new Date(
                            conv.ultima_interaccion
                          ).toLocaleString()}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
              <Grid item xs={12} md={8}>
                <Paper elevation={2} className="p-4 h-[500px] overflow-y-auto">
                  {conversationData[selectedConversation]?.interacciones.map(
                    (message, index) => (
                      <React.Fragment
                        key={message._id || `interaccion-${index}`}
                      >
                        {/* Mensaje del cliente */}
                        {message.mensaje_cliente && (
                          <Box className="mb-4 flex justify-end">
                            <Box className="p-3 rounded-lg max-w-[70%] bg-green-100 text-green-800">
                              <Typography variant="body1">
                                {message.mensaje_cliente}
                              </Typography>
                              <Typography
                                variant="caption"
                                className="mt-1 text-gray-500"
                              >
                                {message.fecha
                                  ? new Date(message.fecha).toLocaleString(
                                      "es-ES",
                                      {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )
                                  : "Fecha no disponible"}
                              </Typography>
                            </Box>
                          </Box>
                        )}

                        {/* Mensaje del chatbot */}
                        {message.mensaje_chatbot &&
                          message.mensaje_chatbot
                            .split("|")
                            .map((botMessage, index) => (
                              <Box
                                key={`bot-message-${index}`}
                                className="mb-4 flex justify-start"
                              >
                                <Box className="p-3 rounded-lg max-w-[70%] bg-blue-100 text-blue-800">
                                  <Typography variant="body1">
                                    {botMessage.trim()}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    className="mt-1 text-gray-500"
                                  >
                                    {message.fecha
                                      ? new Date(message.fecha).toLocaleString(
                                          "es-ES",
                                          {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          }
                                        )
                                      : "Fecha no disponible"}
                                  </Typography>
                                </Box>
                              </Box>
                            ))}
                      </React.Fragment>
                    )
                  )}
                </Paper>
              </Grid>
            </Grid>
          ) : (
            <Typography>No hay datos de conversación disponibles.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConversationDialogClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}