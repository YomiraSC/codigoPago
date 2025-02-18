"use client";

import React, { useRef, useState } from "react";
import { Box, Paper, Snackbar, Alert } from "@mui/material";
import CalendarView from "../components/CalendarView";
import Toolbar from "../components/Toolbar";
import usePromesasPago from "@/hooks/usePromesasPago";

const PromesasPagoPage = () => {
  const { promesas, loading, fetchPromesasPago, error } = usePromesasPago();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const calendarRef = useRef(null);

  const handleRefresh = () => {
    fetchPromesasPago();
    setSnackbarMessage("Datos actualizados");
    setSnackbarSeverity("success");
    setOpenSnackbar(true);
  };

  return (
    <Box sx={{ height: "auto", backgroundColor: "#ffffff", p: 3, overflow: "hidden" }}>
      <Paper elevation={2} sx={{ p: 2, height: "100%" }}>
        <Toolbar onRefresh={handleRefresh} />
        <CalendarView calendarRef={calendarRef} events={promesas} loading={loading} />
      </Paper>

      <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={() => setOpenSnackbar(false)}>
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PromesasPagoPage;
