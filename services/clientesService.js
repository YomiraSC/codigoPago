import axiosInstance from "./api";

export const fetchClientes = async ({ page = 1, pageSize = 10, filters = {}, sortModel = [] ,gestor,role}) => {
  // try {
  //   const params = {
  //     page,
  //     pageSize,
  //     search: filters.search || "",
  //     activo: filters.activo !== "Todos" ? filters.activo : undefined,
  //     responded: filters.responded !== "Todos" ? filters.responded : undefined,
  //     tipoCod: filters.tipoCod !== "Todos" ? filters.tipoCod : undefined,
  //     bound: filters.bound !== "Todos" ? filters.bound : undefined,
  //     fechaInicio: filters.fechaInicio || undefined,
  //     fechaFin: filters.fechaFin || undefined,
  //     orderBy: sortModel.length ? sortModel[0].field : "fecha_creacion",
  //     order: sortModel.length ? sortModel[0].sort : "asc",
  //     gestor:gestor,
  //     role:role
  //   };

  //   console.log("📡 Enviando solicitud con parámetros:", params);

  //   const response = await axiosInstance.get("/clientes", { params });
  //   console.log("xd",response);
  //   return response.data;
  // } catch (error) {
  //   console.error("❌ Error al obtener clientes:", error);
  //   return { clientes: [], total: 0 };
  // }
  try {
    const qs = new URLSearchParams();

    // Paginación
    qs.set("page", String(page));
    qs.set("pageSize", String(pageSize));

    // Helper
    const setIf = (k, v) => {
      if (v !== undefined && v !== null && v !== "" && v !== "Todos") qs.set(k, String(v));
    };
    const toISO = (d) => (d ? new Date(d).toISOString() : "");

    // Filtros que SÍ usa el back
    setIf("search", filters.search);
    setIf("estado", filters.estado);
    setIf("bound", filters.bound);
    setIf("interaccionBot", filters.interaccionBot);
    setIf("accionComercial", filters.accionComercial);
    setIf("gestor", gestor);
    setIf("role", role);

    if (filters.fechaInicio && filters.fechaFin) {
      qs.set("fechaInicio", toISO(filters.fechaInicio));
      qs.set("fechaFin", toISO(filters.fechaFin));
    }
    if (filters.fechaRegistro) {
      // acepta yyyy-mm o fecha -> el back lo normaliza
      const base = /^\d{4}-\d{2}$/.test(filters.fechaRegistro)
        ? `${filters.fechaRegistro}-01`
        : filters.fechaRegistro;
      qs.set("fechaRegistro", toISO(base));
    }

    // (Si luego habilitas orden dinámico:)
    // if (sortModel?.length) {
    //   qs.set("orderBy", sortModel[0].field);
    //   qs.set("order", sortModel[0].sort || "asc");
    // }

    const url = `/clientes?${qs.toString()}`;
    const { data } = await axiosInstance.get(url);
    return data;
  } catch (error) {
    console.error("❌ Error al obtener clientes:", error);
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
      console.log("conver id pasa");
      const response = await axiosInstance.get(`/conversacion/${clienteId}`);
      console.log("response: ",response.data.conversaciones);
      return response.data.conversaciones;  // Devuelve solo el array de conversaciones
    } catch (error) {
      console.error("Error al obtener conversación:", error);
      return [];
    }
  };
  export const getGestores = async () => {
    try {
      const response = await axiosInstance.get("/gestores");
      return response.data;
    } catch (error) {
      console.error("Error al obtener gestores:", error);
      return [];
    }
  };

  export const updateCliente = async (clienteData) => {
    try {
      console.log("actual",clienteData);

      const response = await axiosInstance.put(`/clientes/${clienteData.id}`, {
        estado: clienteData.estado,
        accion: clienteData.accion,
        gestor: clienteData.gestor,
        observaciones: clienteData.observaciones,
        fechaPromesaPago: clienteData.fechaPromesaPago || null, // Asegurar que se envía null si está vacío
        celular: clienteData.telefono,
      });

      return response.data;
    } catch (error) {
      console.error("❌ Error al actualizar cliente:", error);
      throw error;
    }
};
