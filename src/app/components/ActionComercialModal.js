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
  Button, TextField, MenuItem, Select, FormControl, InputLabel, Typography, Box, Paper
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";

const ActionComercialModal = ({ open, onClose, cliente, gestores = [], onSaved }) => {
  const [clienteData, setClienteData] = useState({
    cliente_id: null,
    nombre: "",
    email: "",
    celular: "",
    gestor: "",
    observaciones: "",
    estado: "",
    plantillaId: "",
    codigo: ""
  });

  const [estadoEditable, setEstadoEditable] = useState(true);
  const [mostrarFechaPromesa, setMostrarFechaPromesa] = useState(false);
  const [plantillas, setPlantillas] = useState([]);
  const [enviando, setEnviando] = useState(false);

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
      accion: cliente.accion || "",
      estado: cliente.estado || "",
      fechaPromesaPago: cliente.fechaPromesaPago ? dayjs(cliente.fechaPromesaPago) : null,
    }));
    const a = cliente.accion;
    setEstadoEditable(!(a === "No interesado" || a === "Promesa de Pago"));
    setMostrarFechaPromesa(a === "Promesa de Pago");
  }, [cliente]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "accion") {
      let nuevoEstado = clienteData.estado;
      let bloquear = false, mostrarFecha = false;
      if (value === "No interesado") { nuevoEstado = "No interesado"; bloquear = true; }
      else if (value === "Promesa de Pago") { nuevoEstado = "Promesa de Pago"; bloquear = true; mostrarFecha = true; }
      setClienteData((p) => ({ ...p, accion: value, estado: nuevoEstado }));
      setEstadoEditable(!bloquear); setMostrarFechaPromesa(mostrarFecha); return;
    }
    setClienteData((p) => ({ ...p, [name]: value }));
  };

  const handleDateChange = (date) => setClienteData((p) => ({ ...p, fechaPromesaPago: date }));

  // --- Vista previa dinámica de la plantilla ---
  const plantillaSeleccionada = useMemo(
    () => plantillas.find(p => String(p.id) === String(clienteData.plantillaId)),
    [plantillas, clienteData.plantillaId]
  );

  const previewMensaje = useMemo(() => {
    if (!plantillaSeleccionada?.mensaje) return "";
    let msg = String(plantillaSeleccionada.mensaje);

    // Normalizamos datos
    const nombre = clienteData.nombre || cliente?.nombre || "[NOMBRE]";
    const codigo = clienteData.codigo?.trim() || "[CÓDIGO]";

    // Reemplazos conocidos
    msg = msg.replace(/\{\{\s*nombre\s*\}\}/gi, nombre);
    msg = msg.replace(/\{\{\s*codigo\s*\}\}/gi, codigo);
    // Meta también usa placeholders numerados: {{1}}, {{2}}, ...
    // Si solo hay uno, asumimos que es el código
    msg = msg.replace(/\{\{\s*1\s*\}\}/g, codigo);

    return msg;
  }, [plantillaSeleccionada, clienteData.codigo, clienteData.nombre, cliente]);

  const handleSave = async () => {
    if (!clienteData.gestor) return alert("Selecciona un gestor");
    if (!clienteData.plantillaId) return alert("Selecciona una plantilla");
    if (!clienteData.codigo?.trim()) return alert("Ingresa el código para la plantilla");

    setEnviando(true);
    try {
      const body = {
        cliente_id: clienteData.cliente_id || null,
        estado: clienteData.estado || "",
        nota: clienteData.observaciones || "",
        fecha_promesa_pago: clienteData.fechaPromesaPago ? clienteData.fechaPromesaPago.toISOString() : null,
        accion: clienteData.accion || "",
        gestor: clienteData.gestor,
        plantilla_id: clienteData.plantillaId,
        variables: { codigo: clienteData.codigo.trim() },
        cliente_contacto: {
          nombre: clienteData.nombre,
          celular: (clienteData.celular || "").replace(/\D/g, "") // 51XXXXXXXXX
        }
      };

      const res = await fetch("/api/accion_comercial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      // if (!res.ok) { console.error(data); alert(data.error || "Error al guardar y enviar"); return; }
      // if (onSaved) onSaved();
      // onClose();
      // Considera 'success' explícito, no solo res.ok
      if (!data?.success) {
        console.error("Fallo en envío Meta:", data);
        const detail =
          data?.meta_error?.error?.error_user_msg ||
          data?.meta_error?.error?.message ||
          data?.warning ||
          data?.error ||
          "No se pudo enviar el mensaje";
        alert(`Guardado en BD, pero falló el WhatsApp: ${detail}`);
        return;
      }
      if (onSaved) onSaved();
      onClose();
    } catch (e) {
      console.error(e); alert("Error de red al guardar/enviar");
    } finally { setEnviando(false); }
  };
  const handleDialogRequestClose = (event, reason) => {
    // No dejes cerrar mientras envía o si quieres obligar a leer el error
    if (enviando) return;
    // Bloquea cierres por click fuera o ESC
    if (reason === "backdropClick" || reason === "escapeKeyDown") return;
    onClose();
  };
  return (
    <Dialog open={open} onClose={handleDialogRequestClose} maxWidth="sm" fullWidth>
      <DialogTitle>Acción Comercial (Cliente)</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" fontWeight="bold">
          Usuario actual: {cliente?.nombre || "N/A"}
        </Typography>

        <TextField label="Nombre" fullWidth margin="dense" name="nombre" value={clienteData.nombre} onChange={handleChange} />
        <TextField label="Email" fullWidth margin="dense" name="email" value={clienteData.email} onChange={handleChange} />
        <TextField label="Teléfono" fullWidth margin="dense" name="celular" value={clienteData.celular} onChange={handleChange} />

        <FormControl fullWidth margin="dense">
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

        <TextField label="Observaciones" fullWidth margin="dense" name="observaciones" multiline rows={3} value={clienteData.observaciones} onChange={handleChange} />

        <FormControl fullWidth margin="dense">
          <InputLabel>Acción Comercial</InputLabel>
          <Select name="accion" value={clienteData.accion} onChange={handleChange}>
            <MenuItem value="">Seleccionar acción</MenuItem>
            <MenuItem value="Volver a contactar">Volver a contactar</MenuItem>
            <MenuItem value="No interesado">No interesado</MenuItem>
            <MenuItem value="Promesa de Pago">Promesa de Pago</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth margin="dense">
          <InputLabel>Estado</InputLabel>
          <Select name="estado" value={clienteData.estado} onChange={handleChange} disabled={!estadoEditable}>
            <MenuItem value="">Seleccionar estado</MenuItem>
            <MenuItem value="Interesado">Interesado</MenuItem>
            <MenuItem value="En seguimiento">En seguimiento</MenuItem>
            <MenuItem value="No interesado">No interesado</MenuItem>
            <MenuItem value="Promesa de Pago">Promesa de Pago</MenuItem>
            <MenuItem value="Finalizado">Finalizado</MenuItem>
          </Select>
        </FormControl>

        {mostrarFechaPromesa && (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Fecha de Promesa de Pago"
              value={clienteData.fechaPromesaPago}
              onChange={handleDateChange}
              slotProps={{ textField: { fullWidth: true, margin: "dense" } }}
            />
          </LocalizationProvider>
        )}

        {/* Plantilla */}
        <FormControl fullWidth margin="dense">
          <InputLabel>Plantilla</InputLabel>
          <Select name="plantillaId" value={clienteData.plantillaId} onChange={handleChange}>
            <MenuItem value="">Seleccionar plantilla</MenuItem>
            {plantillas.map((p) => (
              <MenuItem key={p.id} value={p.id}>{p.nombre_template}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Código */}
        <TextField
          label="Código"
          fullWidth
          margin="dense"
          name="codigo"
          value={clienteData.codigo}
          onChange={handleChange}
          placeholder="Ingresa el código"
        />

        {/* Vista previa */}
        {clienteData.plantillaId && (
          <Box mt={2}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Vista previa</Typography>
            <Paper variant="outlined" sx={{ p: 1.5, whiteSpace: "pre-wrap", fontSize: 14 }}>
              {previewMensaje || "—"}
            </Paper>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
        <Button onClick={handleSave} variant="contained" disabled={enviando}>
          {enviando ? "Enviando..." : "Guardar y enviar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ActionComercialModal;
