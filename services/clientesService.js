import axiosInstance from "./api";

export const fetchClientes = async ({ page, pageSize, filters, sortModel }) => {
  try {
    const params = {
      page,
      pageSize,
      search: filters.search || undefined,
      estado: filters.estado !== "Todos" ? filters.estado : undefined,
      bound: filters.bound !== "Todos" ? filters.bound : undefined,
      fechaInicio: filters.fechaInicio || undefined,
      fechaFin: filters.fechaFin || undefined,
      orderBy: sortModel.length ? sortModel[0].field : undefined,  // 🔹 Campo de ordenamiento
      order: sortModel.length ? sortModel[0].sort : undefined,  // 🔹 Orden (asc o desc)
    };

    const response = await axiosInstance.get("/clientes", { params });
    return response.data;
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return { clientes: [], total: 0 };
  }
};

export const fetchClienteById = async (id) => {
    try {
      const response = await axiosInstance.get(`/clientes/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener detalle del cliente:", error);
      return null;
    }
  };

  export const fetchConversacion = async (clienteId) => {
    try {
      const response = await axiosInstance.get(`/api/conversacion/${clienteId}`);
      return response.data.conversaciones;  // Devuelve solo el array de conversaciones
    } catch (error) {
      console.error("Error al obtener conversación:", error);
      return [];
    }
  };