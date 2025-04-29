import { useState, useEffect } from "react";
import { 
  getCampaignById, 
  removeClientFromCampaign, 
  uploadClients, 
  sendCampaignMessages 
} from "../../services/campaignService";
import { Snackbar, Alert } from "@mui/material"; 

const useCampaignDetail = (id) => {
  const [campaign, setCampaign] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const fetchCampaignDetail = async () => {
    setLoading(true);
    try {
      const { campanha_id, descripcion, nombre_campanha, fecha_creacion, fecha_fin, estado_campanha, 
              mensaje_cliente, template, clientes, pagination: pagData } = await getCampaignById(id, pagination.page, pagination.pageSize);
        console.log("camp id use: ", campanha_id);
      // Actualiza la información de la campaña
      setCampaign({
        campanha_id,
        descripcion,
        nombre_campanha,
        fecha_creacion,
        fecha_fin,
        estado_campanha,
        mensaje_cliente,
        template
      });
      
      // Actualiza la lista de clientes y la paginación
      setClients(clientes);
      setPagination((prev) => ({
        ...prev,
        total: pagData.total,
        page: pagData.page,
        pageSize: pagData.pageSize,
      }));

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaignDetail();
    console.log("clientes",clients)
  }, [id, pagination.page, pagination.pageSize]);

  return {
    campaign,
    clients,
    loading,
    error,
    pagination,
    setPagination,
    fetchCampaignDetail,
    handleAddClient: async (clientId) => {
      await addClientToCampaign(id, clientId);
      fetchCampaignDetail();
    },
    handleRemoveClient: async (clientId) => {
      await removeClientFromCampaign(id, clientId);
      fetchCampaignDetail();
    },
    handleUploadClients: async (file) => {
      console.log("se paso a handleUploadClients: ",id);
      await uploadClients(id,file);
      fetchCampaignDetail();
    },
    // handleSendCampaign: async () => {
    //   try {
    //     await sendCampaignMessages(id);
    //     setSnackbarMessage("Mensajes enviados correctamente!");
    //     setSnackbarSeverity("success");
    //     setSnackbarOpen(true);
    //   } catch (err) {
        
    //     setSnackbarMessage("Hubo un error al enviar los mensajes.");
    //     setSnackbarSeverity("error");
    //     setSnackbarOpen(true);
    //   }
    // },
    //para que muestre los que fallaron
    handleSendCampaign: async () => {
      try {
        const { sentMessages } = await sendCampaignMessages(id);
    
        const fallidos = sentMessages.filter(m => m.status === "error");
        
        if (fallidos.length > 0) {
          const numerosFallidos = fallidos.map(f => f.to).join(", ");
          setSnackbarMessage(`Se enviaron algunos mensajes, pero fallaron estos números: ${numerosFallidos}`);
          setSnackbarSeverity("warning");
        } else {
          setSnackbarMessage("Mensajes enviados correctamente!");
          setSnackbarSeverity("success");
        }
    
        setSnackbarOpen(true);
      } catch (err) {
        // Manejar error más crítico, por ejemplo, si ni siquiera se pudo ejecutar la función
        const mensajesFallidos = err?.response?.data?.sentMessages?.filter(m => m.status === "error") || [];
        const numeros = mensajesFallidos.map(m => m.to).join(", ");
    
        const mensaje = mensajesFallidos.length
          ? `Error al enviar mensajes. Fallaron estos números: ${numeros}`
          : "Hubo un error al enviar los mensajes.";
    
        setSnackbarMessage(mensaje);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    },
    
    snackbar: (
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    ),
  };
};

export default useCampaignDetail;