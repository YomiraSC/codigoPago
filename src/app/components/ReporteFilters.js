import { useState } from "react";
import { Grid, FormControl, InputLabel, Select, MenuItem, TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";
import { startOfDay, endOfDay, subDays } from "date-fns";

// 📌 Opciones de rangos predefinidos
const presets = [
  { label: "Hoy", value: 0 },
  { label: "Últimos 7 días", value: 7 },
  { label: "Últimos 30 días", value: 30 },
  { label: "Este mes", value: "month" },
  { label: "Personalizado", value: "custom" },
];

const ReporteFilters = ({ startDate, endDate, setStartDate, setEndDate }) => {
  const [preset, setPreset] = useState(0); // Estado del selector de rango

  // 📌 Manejo del cambio en el selector de rangos
  const handlePresetChange = (event) => {
    const value = event.target.value;
    setPreset(value);

    let newStart, newEnd;
    if (value === 0) {
      newStart = startOfDay(new Date());
      newEnd = endOfDay(new Date());
    } else if (value === 7 || value === 30) {
      newStart = startOfDay(subDays(new Date(), value));
      newEnd = endOfDay(new Date());
    } else if (value === "month") {
      const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      newStart = startOfDay(firstDay);
      newEnd = endOfDay(new Date());
    } else {
      return; // 🔹 Si es "custom", el usuario elegirá manualmente las fechas
    }

    setStartDate(newStart);
    setEndDate(newEnd);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Grid container spacing={2} alignItems="center">
        {/* 📌 Selector de rango predefinido */}
        <Grid item xs={4}>
          <FormControl fullWidth>
            <InputLabel>Rango de Fechas</InputLabel>
            <Select value={preset} onChange={handlePresetChange}>
              {presets.map((preset) => (
                <MenuItem key={preset.value} value={preset.value}>
                  {preset.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* 📌 Selector de Fecha de Inicio */}
        <Grid item xs={4}>
          <DatePicker
            label="Fecha Inicial"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            renderInput={(params) => <TextField {...params} fullWidth />}
            disabled={preset !== "custom"} // 🔹 Se habilita solo en "Personalizado"
          />
        </Grid>

        {/* 📌 Selector de Fecha Final */}
        <Grid item xs={4}>
          <DatePicker
            label="Fecha Final"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            renderInput={(params) => <TextField {...params} fullWidth />}
            disabled={preset !== "custom"} // 🔹 Se habilita solo en "Personalizado"
          />
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

export default ReporteFilters;
