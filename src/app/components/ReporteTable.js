"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import CustomDataGrid from "./CustomDataGrid";
import { REPORTE_COLUMNS } from "../../constants/reporteColumns";

const ReporteTable = ({ estadosData, totalEstadosData }) => {
  // Transformar datos para que incluyan la cobertura porcentual
  const rows = estadosData.map((datos, index) => ({
    id: index + 1, // Se requiere un ID único
    estado: datos.estado,
    converge: datos.converge,
    recencia: datos.recencia,
    intensity: datos.intensity,
    acciones: datos.accion, // Este campo será renderizado con chips
  }));

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333", mb: 2 }}>
        Total de Leads: {totalEstadosData}
      </Typography>
      <CustomDataGrid
        rows={rows}
        columns={REPORTE_COLUMNS()}
        totalRows={rows.length}
        pagination={{ page: 1, pageSize: 10, total: rows.length }}
        setPagination={() => {}} // No es necesario modificar la paginación aquí
        sortModel={[]} // No hay ordenamiento por ahora
        setSortModel={() => {}} // No es necesario modificar el sort
      />
    </Box>
  );
};

export default ReporteTable;
