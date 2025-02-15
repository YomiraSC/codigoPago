"use client";
import { TextField, MenuItem, Button } from "@mui/material";

export default function ClientesFilters({ filters, setFilters }) {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <TextField label="Buscar..." size="small" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
      <TextField select label="Estado" size="small" value={filters.estado} onChange={(e) => setFilters({ ...filters, estado: e.target.value })}>
        <MenuItem value="Todos">Todos</MenuItem>
        <MenuItem value="Interesado">Interesado</MenuItem>
        <MenuItem value="Promesa de Pago">Promesa de Pago</MenuItem>
        <MenuItem value="No interesado">No interesado</MenuItem>
        <MenuItem value="Finalizado">Finalizado</MenuItem>
        <MenuItem value="En seguimiento">En seguimiento</MenuItem>
      </TextField>
      <Button variant="contained" onClick={() => setFilters({ search: "", estado: "Todos", bound: "Todos", fechaInicio: "", fechaFin: "" })}>
        LIMPIAR
      </Button>
    </div>
  );
}
