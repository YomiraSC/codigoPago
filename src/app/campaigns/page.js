"use client";

import { Box, Button, Typography, CircularProgress, Alert } from "@mui/material";
import CustomDataGrid from "../components/CustomDataGrid";
import CampaignModal from "../components/CampaignModal";
import useCampaigns from "../../hooks/useCampaigns";
import { CAMPAIGN_COLUMNS } from "@/constants/columnsCampaigns";

const CampaignsPage = () => {
  const {
    campaigns,
    pagination,
    setPagination,
    sortModel,
    setSortModel,
    openModal,
    selectedCampaign,
    handleEdit,
    handleClose,
    fetchCampaigns,
    handleCreate,
    loading,
    error,
  } = useCampaigns();

  return (
    <Box p={3} width="100%" maxWidth="1200px" margin="auto">
      <Typography variant="h4" fontWeight="bold">CAMPAÑAS</Typography>
      <Box display="flex" justifyContent="space-between" my={2}>
        <Button variant="contained" color="primary" onClick={handleCreate}>
          + NUEVA CAMPAÑA
        </Button>
       
      </Box>

      {/* 🔹 Mostrar error si falla la API */}
      {error && <Alert severity="error">{error}</Alert>}

      {/* 🔹 Mostrar Spinner si está cargando */}
      {loading ? (
        <Box display="flex" justifyContent="center" my={3}>
          <CircularProgress />
        </Box>
      ) : (
        <Box width="100%" sx={{ overflowX: "auto" }}>
          <CustomDataGrid
            rows={campaigns}
            columns={CAMPAIGN_COLUMNS(handleEdit)}
            totalRows={pagination.total}
            pagination={pagination}
            setPagination={setPagination}
            sortModel={sortModel}
            setSortModel={setSortModel}
          />
        </Box>
      )}

      <CampaignModal open={openModal} onClose={handleClose} campaign={selectedCampaign} />
    </Box>
  );
};

export default CampaignsPage;
