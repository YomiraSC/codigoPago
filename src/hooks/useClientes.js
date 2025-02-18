import { useState, useEffect } from "react";
import { fetchClientes, fetchConversacion } from "../../services/clientesService";

export function useClientes() {
  const [clientes, setClientes] = useState([]);
  const [totalClientes, setTotalClientes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openConversationModal, setOpenConversationModal] = useState(false);
  const [cliente, setCliente] = useState(null);
  const [conversationData, setConversationData] = useState(null);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(0);
  
  const [filters, setFilters] = useState({
    search: "",
    estado: "Todos",
    bound: "Todos",
    fechaInicio: "",
    fechaFin: "",
  });

  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [sortModel, setSortModel] = useState([]);  

  useEffect(() => {
    const loadClientes = async () => {
      setLoading(true);
      const data = await fetchClientes({ page: pagination.page, pageSize: pagination.pageSize, filters, sortModel });
      setClientes(data.clientes);
      setTotalClientes(data.total);
      setLoading(false);
    };
    loadClientes();
  }, [filters, pagination, sortModel]);  

  // 🔹 Función para manejar el modal de acción comercial
  const handleAccionComercial = (cliente) => {
    setCliente(cliente);
    setOpenModal(true);
  };

  // 🔹 Función para manejar el cierre del modal
  const handleClose = () => {
    setOpenModal(false);
    setCliente(null);
  };

  // 🔹 Función para obtener la conversación del cliente
  const handleVerConversacion = async (clienteId) => {
    setConversationLoading(true);
    setOpenConversationModal(true);

    try {
      const data = await fetchConversacion(clienteId);
      setConversationData(data);
    } catch (error) {
      console.error("Error al obtener la conversación:", error);
      setConversationData(null);
    } finally {
      setConversationLoading(false);
    }
  };

  // 🔹 Función para cerrar el modal de conversación
  const handleCloseConversation = () => {
    setOpenConversationModal(false);
    setConversationData(null);
    setSelectedConversation(0);
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
    openConversationModal,
    cliente, 
    conversationData,
    conversationLoading,
    selectedConversation,
    setSelectedConversation,
    handleAccionComercial,
    handleVerConversacion,
    handleClose,
    handleCloseConversation
  };
}
