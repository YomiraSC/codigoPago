import axiosInstance from "./api";
export const getCampaigns = async (page = 1, pageSize = 10) => {
  try {
    const response = await axiosInstance.get(`/campaigns?page=${page}&pageSize=${pageSize}`);
    return {
      campaigns: response.data.campaigns || [],
      totalCount: response.data.totalCount || 0
    };
  } catch (error) {
    console.error("Error al obtener campañas:", error);
    return { campaigns: [], totalCount: 0 };
  }
};
