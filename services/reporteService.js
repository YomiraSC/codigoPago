import axiosInstance from "./api";

export const getReporte = async (fechaInicio, fechaFin, page, pageSize, sortModel) => {
  try {
    const sortParams = sortModel.length
      ? `&sortField=${sortModel[0].field}&sortOrder=${sortModel[0].sort}`
      : "";

    const response = await axiosInstance.get(
      `/dashboard/reporte?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&page=${page}&pageSize=${pageSize}${sortParams}`
    );

    return response.data;
  } catch (error) {
    console.error("Error al obtener reporte:", error);
    return { estados: [], totalLeads: 0 };
  }
};
