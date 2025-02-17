import { useState, useEffect } from "react";
import { getCampaigns } from "../../services/campaignService";

const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]); // 🔹 Siempre inicia con []
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });
  const [sortModel, setSortModel] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [loading, setLoading] = useState(true); // 🔹 Nuevo estado de carga
  const [error, setError] = useState(null); // 🔹 Nuevo estado de error

  useEffect(() => {
    fetchCampaigns();
  }, [pagination.page, pagination.pageSize]);

  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const { campaigns, totalCount } = await getCampaigns(pagination.page, pagination.pageSize);
      setCampaigns(campaigns || []); // 🔹 Evita undefined
      setPagination((prev) => ({ ...prev, total: totalCount || 0 }));
    } catch (err) {
      setError("Error al obtener campañas");
      setCampaigns([]); // 🔹 Asegura que no sea undefined
    } finally {
      setLoading(false);
    }
  };

  return {
    campaigns,
    pagination,
    setPagination,
    sortModel,
    setSortModel,
    openModal,
    selectedCampaign,
    handleEdit: (campaign) => {
      setSelectedCampaign(campaign);
      setOpenModal(true);
    },
    handleClose: () => {
      setOpenModal(false);
      setSelectedCampaign(null);
    },
    fetchCampaigns,
    handleCreate: () => {
      setSelectedCampaign(null);
      setOpenModal(true);
    },
    loading,
    error,
  };
};

export default useCampaigns;
