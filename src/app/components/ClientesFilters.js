"use client";
import { TextField, MenuItem, Button } from "@mui/material";

export default function ClientesFilters({ filters, setFilters }) {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <TextField label="Buscar..." size="small" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
      <TextField select label="Estado" size="small" value={filters.estado} onChange={(e) => setFilters({ ...filters, estado: e.target.value })}>
        <MenuItem value="Todos">Todos</MenuItem>
        <MenuItem value="Activo">Activo</MenuItem>
        <MenuItem value="Interesado">Interesado</MenuItem>
      </TextField>
      <Button variant="contained" onClick={() => setFilters({ search: "", estado: "Todos", bound: "Todos", fechaInicio: "", fechaFin: "" })}>
        LIMPIAR
      </Button>
    </div>
  );
}
