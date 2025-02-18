import axiosInstance from "./api";

export const getPromesasPago = async () => {
  const response = await axiosInstance.get("/promesas_pago");
  return response.data.map((promesa) => ({
    title: `${promesa.cliente.nombre} (${promesa.cliente.celular})`,
    start: new Date(promesa.fecha),
    end: new Date(new Date(promesa.fecha).getTime() + 30 * 60 * 1000),
    backgroundColor: promesa.estado === "pendiente" ? "#FFC107" : "#4CAF50",
    extendedProps: {
      estado: promesa.estado,
      celular: promesa.cliente.celular,
    },
  }));
};
