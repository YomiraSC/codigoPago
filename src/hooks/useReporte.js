import { useState, useEffect, useMemo } from "react";
import { getReporte } from "../../services/reporteService";
import { startOfDay, endOfDay } from "date-fns";

const useReporte = () => {
  const [estadosData, setEstadosData] = useState([]);
  const [totalEstadosData, setTotalEstadosData] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(startOfDay(new Date()));
  const [endDate, setEndDate] = useState(endOfDay(new Date()));
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [sortModel, setSortModel] = useState([]);

  useEffect(() => {
    fetchEstadosData();
  }, [startDate, endDate, pagination, sortModel]);

  const fetchEstadosData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReporte(
        startDate.toISOString(),
        endDate.toISOString(),
        pagination.page,
        pagination.pageSize,
        sortModel
      );

      console.log("🔹 Datos recibidos:", data);

      if (!data || !data.estados) {
        throw new Error("Datos de API vacíos o incorrectos");
      }

      setEstadosData(data.estados);
      setTotalEstadosData(data.totalLeads);
    } catch (err) {
      console.error("Error al obtener reporte:", err);
      setError("Error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  const reporteConPorcentajes = useMemo(() => {
    if (!estadosData.length || totalEstadosData === 0) return [];

    return estadosData.map((estado) => {
      return {
        ...estado,
        estadoPorcentaje: estado.estado_porcentaje || "0",
        acciones: estado.acciones || {},
      };
    });
  }, [estadosData, totalEstadosData]);

  return {
    estadosData: reporteConPorcentajes,
    totalEstadosData,
    loading,
    error,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    pagination,
    setPagination,
    sortModel,
    setSortModel,
  };
};

export default useReporte;
