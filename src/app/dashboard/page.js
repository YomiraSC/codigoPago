"use client";

import { Container, Typography, Grid } from "@mui/material";
import ReporteFilters from "../components/ReporteFilters";
import CustomDataGrid from "../components/CustomDataGrid";
import useReporte from "../../hooks/useReporte";
import { REPORTE_COLUMNS } from "../../constants/reporteColumns";

export default function DashboardPage() {
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
    pagination,
    setPagination,
    sortModel,
    setSortModel
  } = useReporte();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ color: "#1A202C" }}>
        Reporte de Reactivaciones
      </Typography>
      <br></br>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <ReporteFilters
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomDataGrid
            rows={estadosData}
            columns={REPORTE_COLUMNS()}
            totalRows={totalEstadosData}
            pagination={pagination}
            setPagination={setPagination}
            sortModel={sortModel}
            setSortModel={setSortModel}
            loading={loading}
            error={error}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
