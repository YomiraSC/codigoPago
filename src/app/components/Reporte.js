"use client";

import React from "react";
import {
  Paper,
  Typography,
  Box,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Download, Refresh } from "@mui/icons-material";
import useReporte from "../../hooks/useReporte";
import ReporteFilters from "./ReporteFilters";
import ReporteTable from "./ReporteTable"; // Componente separado para la tabla

const Reporte = () => {
  const {
    estadosData,
    totalEstadosData,
    loading,
    error,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    setRefresh,
  } = useReporte();

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: "12px", backgroundColor: "#FFFFFF" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#333" }}>
          Reporte de Leads
        </Typography>
        <Box>
          <Tooltip title="Refrescar">
            <IconButton onClick={() => setRefresh((prev) => !prev)}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Descargar PDF">
            <IconButton>
              <Download />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <ReporteFilters startDate={startDate} endDate={endDate} setStartDate={setStartDate} setEndDate={setEndDate} />

      {loading ? (
        <Box display="flex" justifyContent="center" my={3}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <ReporteTable estadosData={estadosData} totalEstadosData={totalEstadosData} />
      )}
    </Paper>
  );
};

export default Reporte;
