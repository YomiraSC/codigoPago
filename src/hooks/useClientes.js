"use client";
import { useState, useEffect } from "react";
import { fetchClientes } from "../../services/clientesService";

export function useClientes() {
  const [clientes, setClientes] = useState([]);
  const [totalClientes, setTotalClientes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [cliente, setCliente] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    estado: "Todos",
    bound: "Todos",
    fechaInicio: "",
    fechaFin: "",
  });

  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [sortModel, setSortModel] = useState([]);  // 🔹 Maneja el ordenamiento del DataGrid

  useEffect(() => {
    const loadClientes = async () => {
      setLoading(true);
      const data = await fetchClientes({ page: pagination.page, pageSize: pagination.pageSize, filters, sortModel });
      setClientes(data.clientes);
      setTotalClientes(data.total);
      setLoading(false);
    };
    loadClientes();
  }, [filters, pagination, sortModel]);  // 🔹 Reactualiza datos cuando cambian filtros, paginación o sortModel

  const guardarAccionComercial = async (clienteActualizado) => {
    try {
      setLoading(true);
      await updateCliente(clienteActualizado); // Llamar a la API para actualizar el cliente
      setClientes((prevClientes) =>
        prevClientes.map((c) => (c.id === clienteActualizado.id ? clienteActualizado : c))
      );
      setOpenModal(false);
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
    } finally {
      setLoading(false);
    }
  }; 
  return {
    clientes,
    totalClientes,
    loading, 
    filters,
    setFilters,
    pagination, 
    setPagination, 
    sortModel, 
    setSortModel, 
    openModal,
    cliente, 
    handleAccionComercial: (cliente) => {
      console.log("🔹 Abriendo modal con cliente:", cliente);

      setCliente(cliente);
      setOpenModal(true);
    },
    handleClose: () => {
      setOpenModal(false);
      setCliente(null);
    },
    guardarAccionComercial,
  };
}
