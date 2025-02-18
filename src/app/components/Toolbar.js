"use client";

import React from "react";
import { Box, Button, ButtonGroup, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

const Toolbar = ({ onRefresh }) => {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
      <Button variant="contained" color="primary" onClick={onRefresh}>
        Refrescar
      </Button>
      <ButtonGroup>
        <IconButton size="small" color="primary"><ChevronLeft /></IconButton>
        <IconButton size="small" color="primary"><ChevronRight /></IconButton>
      </ButtonGroup>
    </Box>
  );
};

export default Toolbar;
