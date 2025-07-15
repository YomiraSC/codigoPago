"use client";
import { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem
} from "@mui/material";

export default function PersonalizadoModal({ open, onClose, templates, onSave }) {
  const [form, setForm] = useState({ celular: "", template_id: "" });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Nuevo Envío Directo</DialogTitle>
      <DialogContent>
        <TextField
          name="celular"
          label="Número de teléfono"
          fullWidth
          margin="dense"
          value={form.celular}
          onChange={handleChange}
        />
        <TextField
          select
          name="template_id"
          label="Seleccionar Template"
          fullWidth
          margin="dense"
          value={form.template_id}
          onChange={handleChange}
        >
          {templates.map(t => (
            <MenuItem key={t.id} value={t.id}>
              {t.nombre_template}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={() => onSave({
            celular: form.celular.trim(),
            template_id: Number(form.template_id),
          })}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
