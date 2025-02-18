import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Typography,
} from "@mui/material";

const ActionComercialModal = ({ open, onClose, cliente, onSave }) => {
  // Estado inicial del cliente
  const [clienteData, setClienteData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    gestor: "",
    observaciones: "",
    accion: "",
    estado: "",
  });

  // Control para bloquear edición de estado
  const [estadoEditable, setEstadoEditable] = useState(true);

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (cliente) {
      setClienteData({
        nombre: cliente.nombre || "",
        email: cliente.email || "",
        telefono: cliente.telefono || "",
        gestor: cliente.gestor || "",
        observaciones: cliente.observaciones || "",
        accion: cliente.accion || "",
        estado: cliente.estado || "",
      });

      // Bloquear la edición del estado si la acción ya es "No interesado" o "Promesa de Pago"
      if (cliente.accion === "No interesado" || cliente.accion === "Promesa de Pago") {
        setEstadoEditable(false);
      } else {
        setEstadoEditable(true);
      }
    }
  }, [cliente]);

  // Manejo de cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Si el usuario cambia la acción comercial, se verifica si debe bloquear la lista de estado
    if (name === "accion") {
      let nuevoEstado = clienteData.estado;
      let bloquearEstado = false;

      if (value === "No interesado") {
        nuevoEstado = "No interesado";
        bloquearEstado = true;
      } else if (value === "Promesa de Pago") {
        nuevoEstado = "Promesa de Pago";
        bloquearEstado = true;
      } else {
        bloquearEstado = false;
      }

      setClienteData((prev) => ({ ...prev, accion: value, estado: nuevoEstado }));
      setEstadoEditable(!bloquearEstado);
    } else {
      setClienteData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Guardar cambios
  const handleSave = () => {
    onSave(clienteData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Acción Comercial (Cliente)</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" fontWeight="bold">
          Usuario actual: {cliente?.nombre || "N/A"}
        </Typography>

        <TextField
          label="Nombre"
          fullWidth
          margin="dense"
          name="nombre"
          value={clienteData.nombre}
          onChange={handleChange}
        />

        <TextField
          label="Email"
          fullWidth
          margin="dense"
          name="email"
          value={clienteData.email}
          onChange={handleChange}
        />

        <TextField
          label="Teléfono"
          fullWidth
          margin="dense"
          name="telefono"
          value={clienteData.telefono}
          onChange={handleChange}
        />

        <FormControl fullWidth margin="dense">
          <InputLabel>Gestor</InputLabel>
          <Select name="gestor" value={clienteData.gestor} onChange={handleChange}>
            <MenuItem value="">Sin gestor asignado</MenuItem>
            <MenuItem value="Gestor 1">Gestor 1</MenuItem>
            <MenuItem value="Gestor 2">Gestor 2</MenuItem>
            <MenuItem value="Gestor 3">Gestor 3</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Observaciones"
          fullWidth
          margin="dense"
          name="observaciones"
          multiline
          rows={3}
          value={clienteData.observaciones}
          onChange={handleChange}
        />

        {/* Selección de Acción Comercial */}
        <FormControl fullWidth margin="dense">
          <InputLabel>Acción Comercial</InputLabel>
          <Select name="accion" value={clienteData.accion} onChange={handleChange}>
            <MenuItem value="">Seleccionar acción</MenuItem>
            <MenuItem value="Volver a contactar">Volver a contactar</MenuItem>
            <MenuItem value="No interesado">No interesado</MenuItem>
            <MenuItem value="Promesa de Pago">Promesa de Pago</MenuItem>
          </Select>
        </FormControl>

        {/* Selección de Estado (editable o bloqueado) */}
        <FormControl fullWidth margin="dense">
          <InputLabel>Estado</InputLabel>
          <Select
            name="estado"
            value={clienteData.estado}
            onChange={handleChange}
            disabled={!estadoEditable} // 🔹 Se deshabilita si es "No interesado" o "Promesa de Pago"
          >
            <MenuItem value="">Seleccionar estado</MenuItem>
            <MenuItem value="Interesado">Interesado</MenuItem>
            <MenuItem value="En seguimiento">En seguimiento</MenuItem>
            <MenuItem value="No interesado">No interesado</MenuItem>
            <MenuItem value="Promesa de Pago">Promesa de Pago</MenuItem>
            <MenuItem value="Finalizado">Finalizado</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cerrar
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ActionComercialModal;
