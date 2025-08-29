// import { useState, useEffect } from "react";
// import {
//     Dialog,
//     DialogTitle,
//     DialogContent,
//     DialogActions,
//     Button,
//     TextField,
//     MenuItem,
//     Select,
//     FormControl,
//     InputLabel,
//     Typography
// } from "@mui/material";
// import { DatePicker } from "@mui/x-date-pickers";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import { LocalizationProvider } from "@mui/x-date-pickers";
// import dayjs from "dayjs";

// const ActionComercialModal = ({ open, onClose, cliente, gestores, onSave }) => {
//     const [clienteData, setClienteData] = useState({
//         nombre: "",
//         email: "",
//         telefono: "",
//         gestor: "",
//         observaciones: "",
//         accion: "",
//         estado: "",
//         fechaPromesaPago: null, 
//     });

//     const [estadoEditable, setEstadoEditable] = useState(true);
//     const [mostrarFechaPromesa, setMostrarFechaPromesa] = useState(false);

//     useEffect(() => {
//         if (cliente) {
//             setClienteData({
//                 id: cliente.id || "",
//                 nombre: cliente.nombre || "",
//                 email: cliente.email || "",
//                 telefono: cliente.celular || "",
//                 gestor: cliente.gestor || "",
//                 observaciones: cliente.observaciones || "",
//                 accion: cliente.accion || "",
//                 estado: cliente.estado || "",
//                 fechaPromesaPago: cliente.fechaPromesaPago ? dayjs(cliente.fechaPromesaPago) : null,
//             });

//             if (cliente.accion === "No interesado" || cliente.accion === "Promesa de Pago") {
//                 setEstadoEditable(false);
//             } else {
//                 setEstadoEditable(true);
//             }

//             setMostrarFechaPromesa(cliente.accion === "Promesa de Pago");
//         }
//     }, [cliente]);

//     const handleChange = (e) => {
//         const { name, value } = e.target;

//         if (name === "accion") {
//             let nuevoEstado = clienteData.estado;
//             let bloquearEstado = false;
//             let mostrarFecha = false;

//             if (value === "No interesado") {
//                 nuevoEstado = "No interesado";
//                 bloquearEstado = true;
//             } else if (value === "Promesa de Pago") {
//                 nuevoEstado = "Promesa de Pago";
//                 bloquearEstado = true;
//                 mostrarFecha = true;
//             } else {
//                 bloquearEstado = false;
//             }

//             setClienteData((prev) => ({ ...prev, accion: value, estado: nuevoEstado }));
//             setEstadoEditable(!bloquearEstado);
//             setMostrarFechaPromesa(mostrarFecha);
//         } else {
//             setClienteData((prev) => ({ ...prev, [name]: value }));
//         }
//     };

//     const handleDateChange = (date) => {
//         setClienteData((prev) => ({ ...prev, fechaPromesaPago: date }));
//     };

//     const handleSave = () => {
//         onSave(clienteData);
//         onClose();
//     };

//     return (
//         <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
//             <DialogTitle>Acción Comercial (Cliente)</DialogTitle>
//             <DialogContent>
//                 <Typography variant="subtitle1" fontWeight="bold">
//                     Usuario actual: {cliente?.nombre || "N/A"}
//                 </Typography>

//                 <TextField label="Nombre" fullWidth margin="dense" name="nombre" value={clienteData.nombre} onChange={handleChange} />
//                 <TextField label="Email" fullWidth margin="dense" name="email" value={clienteData.email} onChange={handleChange} />
//                 <TextField label="Teléfono" fullWidth margin="dense" name="telefono" value={clienteData.telefono} onChange={handleChange} />

//                 <FormControl fullWidth margin="dense">
//                     <InputLabel>Gestor</InputLabel>
//                     <Select name="gestor" value={clienteData.gestor} onChange={handleChange}>
//                         <MenuItem value="">Sin gestor asignado</MenuItem>
//                         {gestores.map((gestor) => (
//                             <MenuItem key={gestor.id} value={gestor.nombre_completo}>
//                                 {gestor.nombre_completo}
//                             </MenuItem>
//                         ))}
//                     </Select>
//                 </FormControl>

//                 <TextField label="Observaciones" fullWidth margin="dense" name="observaciones" multiline rows={3} value={clienteData.observaciones} onChange={handleChange} />

//                 <FormControl fullWidth margin="dense">
//                     <InputLabel>Acción Comercial</InputLabel>
//                     <Select name="accion" value={clienteData.accion} onChange={handleChange}>
//                         <MenuItem value="">Seleccionar acción</MenuItem>
//                         <MenuItem value="Volver a contactar">Volver a contactar</MenuItem>
//                         <MenuItem value="No interesado">No interesado</MenuItem>
//                         <MenuItem value="Promesa de Pago">Promesa de Pago</MenuItem>
//                     </Select>
//                 </FormControl>

//                 <FormControl fullWidth margin="dense">
//                     <InputLabel>Estado</InputLabel>
//                     <Select name="estado" value={clienteData.estado} onChange={handleChange} disabled={!estadoEditable}>
//                         <MenuItem value="">Seleccionar estado</MenuItem>
//                         <MenuItem value="Interesado">Interesado</MenuItem>
//                         <MenuItem value="En seguimiento">En seguimiento</MenuItem>
//                         <MenuItem value="No interesado">No interesado</MenuItem>
//                         <MenuItem value="Promesa de Pago">Promesa de Pago</MenuItem>
//                         <MenuItem value="Finalizado">Finalizado</MenuItem>
//                     </Select>
//                 </FormControl>

//                 {mostrarFechaPromesa && (
//                     <LocalizationProvider dateAdapter={AdapterDayjs}>
//                         <DatePicker
//                             label="Fecha de Promesa de Pago"
//                             value={clienteData.fechaPromesaPago}
//                             onChange={handleDateChange}
//                             slotProps={{ textField: { fullWidth: true, margin: "dense" } }}
//                         />
//                     </LocalizationProvider>
//                 )}
//             </DialogContent>

//             <DialogActions>
//                 <Button onClick={onClose} color="primary">
//                     Cerrar
//                 </Button>
//                 <Button onClick={handleSave} variant="contained" color="primary">
//                     Guardar
//                 </Button>
//             </DialogActions>
//         </Dialog>
//     );
// };

// export default ActionComercialModal;


import { useState, useEffect, useMemo } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Select, FormControl, InputLabel, Typography, Box, Paper, Grid, Alert
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';


const ACCIONES = [
  { value: "Duda resuelta", label: "Duda resuelta", icon: <CheckCircleIcon color="success" sx={{mr:1}}/> },
  { value: "Duda no resuelta", label: "Duda no resuelta", icon: <ErrorOutlineIcon color="error" sx={{mr:1}}/> },
  { value: "Codigo entregado", label: "Enviar codigo espcecial", icon: <AssignmentTurnedInIcon color="primary" sx={{mr:1}}/> },
  { value: "Promesa de pago", label: "Promesa de pago", icon: <HelpOutlineIcon color="warning" sx={{mr:1}}/> },
];

const ActionComercialModal = ({ open, onClose, cliente, gestores = [], onSaved }) => {
  console.log("gestores props",cliente);
  const [clienteData, setClienteData] = useState({
    cliente_id: cliente,
    nombre: "",
    email: "",
    celular: "",
    gestor: "",
    observaciones: "",
    accion: "",
    estado: "",
    plantillaId: "",
    codigo: "",
    fechaPromesaPago: null
  });
  const [plantillas, setPlantillas] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (open) cargarPlantillas(); }, [open]);

  const cargarPlantillas = async () => {
    try {
      const res = await fetch("/api/plantillas");
      if (res.ok) {
        const data = await res.json();
        // Asegúrate que /api/plantillas devuelva: [{id, nombre_template, mensaje}, ...]
        setPlantillas(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error("Error cargando plantillas", e); }
  };

  useEffect(() => {
    if (!cliente) return;
    setClienteData((prev) => ({
      ...prev,
      cliente_id: cliente.cliente_id || "",
      nombre: cliente.nombre || "",
      email: cliente.email || "",
      celular: cliente.celular || "",
      gestor: cliente.gestor|| "",
      observaciones: cliente.observaciones || "",
      accion: "",
      estado: "",
      plantillaId: "",
      codigo: "",
      fechaPromesaPago: null
    }));
    setError("");
  }, [cliente, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    if (name === "accion") {
      // Limpiar campos dependientes
      let next = { ...clienteData, accion: value, plantillaId: "", codigo: "", fechaPromesaPago: null };
      setClienteData(next);
      return;
    }
    setClienteData((p) => ({ ...p, [name]: value }));
  };

  const handleDateChange = (date) => {
    setError("");
    setClienteData((p) => ({ ...p, fechaPromesaPago: date }));
  };

  // --- Vista previa dinámica de la plantilla ---
  const plantillaSeleccionada = useMemo(
    () => plantillas.find(p => String(p.id) === String(clienteData.plantillaId)),
    [plantillas, clienteData.plantillaId]
  );

  const previewMensaje = useMemo(() => {
    if (!plantillaSeleccionada?.mensaje) return "";
    let msg = String(plantillaSeleccionada.mensaje);
    const nombre = clienteData.nombre || cliente?.nombre || "[NOMBRE]";
    const codigo = clienteData.codigo?.trim() || "[CÓDIGO]";
    msg = msg.replace(/\{\{\s*nombre\s*\}\}/gi, nombre);
    msg = msg.replace(/\{\{\s*codigo\s*\}\}/gi, codigo);
    msg = msg.replace(/\{\{\s*1\s*\}\}/g, codigo);
    return msg;
  }, [plantillaSeleccionada, clienteData.codigo, clienteData.nombre, cliente]);

  const handleSave = async () => {
    setError("");
    if (!clienteData.gestor) return setError("Selecciona un gestor");
    if (!clienteData.accion) return setError("Selecciona una acción comercial");
    if (clienteData.accion === "Promesa de pago") {
      if (!clienteData.fechaPromesaPago) return setError("Selecciona la fecha de promesa de pago");
    }
    if (clienteData.accion === "Codigo entregado") {
      if (!clienteData.plantillaId) return setError("Selecciona una plantilla");
      if (!clienteData.codigo?.trim()) return setError("Ingresa el código para la plantilla");
    }
    setEnviando(true);
    try {
      const body = {
        cliente_id: cliente.id || null,
        estado: clienteData.estado || clienteData.accion,
        nota: clienteData.observaciones || "",
        fecha_promesa_pago: clienteData.fechaPromesaPago ? clienteData.fechaPromesaPago.toISOString() : null,
        accion: clienteData.accion || "",
        gestor: clienteData.gestor,
        plantilla_id: clienteData.accion === "Codigo entregado" ? clienteData.plantillaId : undefined,
        variables: clienteData.accion === "Codigo entregado" ? { codigo: clienteData.codigo.trim() } : undefined,
        cliente_contacto: {
          nombre: clienteData.nombre,
          celular: (clienteData.celular || "").replace(/\D/g, "")
        }
      };
      const res = await fetch("/api/accion_comercial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data?.success) {
        const detail =
          data?.meta_error?.error?.error_user_msg ||
          data?.meta_error?.error?.message ||
          data?.warning ||
          data?.error ||
          "No se pudo enviar el mensaje";
        setError(`Guardado en BD, pero falló el WhatsApp: ${detail}`);
        return;
      }
      if (onSaved) onSaved();
      onClose();
    } catch (e) {
      setError("Error de red al guardar/enviar");
    } finally { setEnviando(false); }
  };
  const handleDialogRequestClose = (event, reason) => {
    if (enviando) return;
    if (reason === "backdropClick" || reason === "escapeKeyDown") return;
    setError("");
    onClose();
  };
  // --- UI ---
  // --- Validación para habilitar/deshabilitar el botón Guardar y enviar ---
  let guardarHabilitado = true;
  if (!clienteData.gestor || !clienteData.accion) guardarHabilitado = false;
  if (clienteData.accion === "Codigo entregado") {
    if (!clienteData.plantillaId || !clienteData.codigo?.trim()) guardarHabilitado = false;
  }
  if (clienteData.accion === "Promesa de pago") {
    // Solo habilita si hay fecha seleccionada y es hoy o futura
    if (!clienteData.fechaPromesaPago) {
      guardarHabilitado = false;
    } else {
      const hoy = dayjs().startOf('day');
      const fecha = dayjs(clienteData.fechaPromesaPago).startOf('day');
      if (fecha.isBefore(hoy)) guardarHabilitado = false;
    }
  }

  return (
    <Dialog open={open} onClose={handleDialogRequestClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{bgcolor:'#007391', color:'white', fontWeight:700, textAlign:'center', letterSpacing:1}}>
        Acción Comercial
      </DialogTitle>
      <DialogContent sx={{bgcolor:'#f4fafd', pb:3, pt:3, px:{xs:2, sm:4, md:6}}}>
        <Box mb={4} display="flex" alignItems="center" gap={2}>
          <AssignmentTurnedInIcon sx={{fontSize:36, color:'#007391'}}/>
          <Typography variant="h6" fontWeight={600} color="#254e59">
            {clienteData.nombre || cliente?.nombre || "Cliente"}
          </Typography>
        </Box>
        {error && <Alert severity="error" sx={{mb:2}}>{error}</Alert>}
        <Box mb={3}>
          <Typography variant="subtitle2" color="#007391" fontWeight={700} gutterBottom>
            Información general
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <FormControl fullWidth>
                <InputLabel>Gestor</InputLabel>
                <Select name="gestor" value={clienteData.gestor} onChange={handleChange}>
                  <MenuItem value="">Sin gestor asignado</MenuItem>
                  {gestores.map((g) => (
                    <MenuItem key={g.username} value={g.username}>
                      {g.nombre_completo} ({g.username})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
        <Box mb={3}>
          <Typography variant="subtitle2" color="#007391" fontWeight={700} gutterBottom>
            Acción comercial
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <FormControl fullWidth>
                <InputLabel>Acción Comercial</InputLabel>
                <Select name="accion" value={clienteData.accion} onChange={handleChange}>
                  <MenuItem value="">Seleccionar acción</MenuItem>
                  {ACCIONES.map(a => (
                    <MenuItem key={a.value} value={a.value}>{a.icon}{a.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {clienteData.accion === "Promesa de pago" && (
              <Grid item xs={12} md={5}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Fecha de Promesa de Pago"
                    value={clienteData.fechaPromesaPago}
                    onChange={handleDateChange}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
            )}
          </Grid>
        </Box>
        {clienteData.accion === "Codigo entregado" && (
          <Box mb={3}>
            <Typography variant="subtitle2" color="#007391" fontWeight={700} gutterBottom>
              Envío de código
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Plantilla</InputLabel>
                  <Select name="plantillaId" value={clienteData.plantillaId} onChange={handleChange}>
                    <MenuItem value="">Seleccionar plantilla</MenuItem>
                    {plantillas.map((p) => (
                      <MenuItem key={p.id} value={p.id}>{p.nombre_template}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Código"
                  fullWidth
                  name="codigo"
                  value={clienteData.codigo}
                  onChange={handleChange}
                  placeholder="Ingresa el código"
                />
              </Grid>
              {clienteData.plantillaId && (
                <Grid item xs={12}>
                  <Box mt={1}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5, color:'#007391' }}>Vista previa</Typography>
                    <Paper variant="outlined" sx={{ p: 1.5, whiteSpace: "pre-wrap", fontSize: 14, borderColor:'#007391' }}>
                      {previewMensaje || "—"}
                    </Paper>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
        {/* Observaciones abajo, a lo ancho */}
        <Box mb={2}>
          <TextField label="Observaciones" fullWidth name="observaciones" value={clienteData.observaciones} onChange={handleChange} multiline minRows={2} />
        </Box>
      </DialogContent>
      <DialogActions sx={{bgcolor:'#e0f2f1'}}>
        <Button onClick={onClose} sx={{color:'#007391', fontWeight:600}}>Cerrar</Button>
        <Button onClick={handleSave} variant="contained" disabled={enviando || !guardarHabilitado}
          sx={{bgcolor:'#007391', fontWeight:700, ':hover':{bgcolor:'#005c6b'}}}>
          {enviando ? "Enviando..." : "Guardar y enviar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ActionComercialModal;
