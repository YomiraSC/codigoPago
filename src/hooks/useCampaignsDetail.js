import { useState, useEffect, useRef, useCallback } from "react";
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
  // Renombramos el setter interno para poder envolverlo
  const [pagination, setPaginationState] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [campaignStats, setCampaignStats] = useState(null);
  const [sendingInProgress, setSendingInProgress] = useState(false);

  // ✅ Refs para control total de requests
  const isFetchingRef = useRef(false);
  const lastFetchRef = useRef({ page: null, pageSize: null, timestamp: 0 });
  const abortControllerRef = useRef(null);
  const mountedRef = useRef(true);

  // ✅ Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // ✅ Función de fetch ultra-protegida
  const fetchCampaignDetail = useCallback(async (page, pageSize, force = false) => {
    const finalPage = page ?? 1;
    const finalPageSize = pageSize ?? 10;
    const now = Date.now();
    
    // 🛑 BLOQUEO 1: Ya hay un fetch en progreso
    if (isFetchingRef.current) {
      console.log('🛑 [BLOCKED] Fetch already in progress');
      return;
    }

    // 🛑 BLOQUEO 2: Misma página recién fetched (dentro de los últimos 500ms)
    if (!force && 
        lastFetchRef.current.page === finalPage && 
        lastFetchRef.current.pageSize === finalPageSize &&
        (now - lastFetchRef.current.timestamp) < 1000) {
      console.log('🛑 [BLOCKED] Same page fetched recently', {
        page: finalPage,
        timeSince: now - lastFetchRef.current.timestamp
      });
      return;
    }

    // 🛑 BLOQUEO 3: Cancelar request anterior si existe
    if (abortControllerRef.current) {
      console.log('🛑 [ABORT] Cancelling previous request');
      abortControllerRef.current.abort();
    }

    // ✅ Crear nuevo AbortController
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    // ✅ Marcar como fetching
    isFetchingRef.current = true;
    lastFetchRef.current = { 
      page: finalPage, 
      pageSize: finalPageSize,
      timestamp: now
    };
    
    setLoading(true);
    console.log('✅ [FETCH START]', { page: finalPage, pageSize: finalPageSize });
    
    try {
      const { 
        campanha_id, 
        nombre_campanha, 
        fecha_creacion, 
        fecha_fin, 
        estado_campanha,
        mensaje_cliente, 
        template, 
        clientes, 
        pagination: pagData 
      } = await getCampaignById(id, finalPage, finalPageSize);

      // ✅ Solo actualizar si el componente sigue montado
      if (!mountedRef.current || signal.aborted) {
        console.log('🛑 [ABORTED] Component unmounted or request cancelled');
        return;
      }

      setCampaign({
        campanha_id,
        nombre_campanha,
        fecha_creacion,
        fecha_fin,
        estado_campanha,
        mensaje_cliente,
        template
      });

      setClients(clientes);

      setPaginationState({
        page: pagData.page,
        pageSize: pagData.pageSize,
        total: pagData.total,
      });

      console.log('✅ [FETCH SUCCESS]', { page: finalPage, clients: clientes.length });

    } catch (err) {
      if (err.name === 'AbortError' || signal.aborted) {
        console.log('🛑 [FETCH CANCELLED]');
        return;
      }
      
      console.error('❌ [FETCH ERROR]', err);
      if (mountedRef.current) {
        setError(err.message);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      isFetchingRef.current = false;
      abortControllerRef.current = null;
    }
  }, [id]);

  // ✅ Efecto inicial - SOLO cuando cambia el ID
  useEffect(() => {
    console.log('🔄 [EFFECT] ID changed:', id);
    if (!id) return;

    // Reset completo
    isFetchingRef.current = false;
    lastFetchRef.current = { page: null, pageSize: null, timestamp: 0 };

    // Fetch inicial con delay para prevenir race conditions
    const timeoutId = setTimeout(() => {
      if (mountedRef.current) {
        fetchCampaignDetail(1, 10, true);
      }
    }, 50);

    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [id]); // ✅ SOLO id

  // ✅ Funciones de control
  // Esta función envuelve el setState de paginación para ser compatible con
  // - el uso tipo setState de React (prev => ({ ...prev, ... }))
  // - y con llamadas directas (page, pageSize)
  const handlePageChange = useCallback(
    (updaterOrPage, maybePageSize) => {
      // Caso 1: viene como función updater (estilo setState de React)
      if (typeof updaterOrPage === "function") {
        setPaginationState((prev) => {
          const next = updaterOrPage(prev);
          const nextPage = next.page ?? prev.page ?? 1;
          const nextPageSize = next.pageSize ?? prev.pageSize ?? 10;

          console.log("📄 [PAGE CHANGE - updater]", {
            page: nextPage,
            pageSize: nextPageSize,
          });
          fetchCampaignDetail(nextPage, nextPageSize, false);

          return {
            ...prev,
            ...next,
            page: nextPage,
            pageSize: nextPageSize,
          };
        });
        return;
      }

      // Caso 2: llamada directa handlePageChange(page, pageSize)
      const current = pagination;
      const newPage = updaterOrPage ?? current.page ?? 1;
      const newPageSize = maybePageSize ?? current.pageSize ?? 10;

      console.log("📄 [PAGE CHANGE - direct]", {
        page: newPage,
        pageSize: newPageSize,
      });

      // Evitar fetch innecesario si no cambia nada
      if (
        newPage === current.page &&
        newPageSize === current.pageSize
      ) {
        return;
      }

      setPaginationState((prev) => ({
        ...prev,
        page: newPage,
        pageSize: newPageSize,
      }));

      fetchCampaignDetail(newPage, newPageSize, false);
    },
    [fetchCampaignDetail, pagination]
  );

  const refetchCurrent = useCallback(() => {
    console.log('🔄 [REFETCH CURRENT]', { page: pagination.page, pageSize: pagination.pageSize });
    // Force refetch
    lastFetchRef.current.timestamp = 0;
    fetchCampaignDetail(pagination.page, pagination.pageSize, true);
  }, [fetchCampaignDetail, pagination.page, pagination.pageSize]);

  return {
    campaign,
    clients,
    loading,
    error,
    pagination,
    // ⚠️ Este setter se expone ya adaptado para trabajar con CustomDataGrid
    setPagination: handlePageChange,
    fetchCampaignDetail: refetchCurrent,
    
    handleRemoveClient: async (clientId) => {
      try {
        await removeClientFromCampaign(id, clientId);
        lastFetchRef.current.timestamp = 0;
        fetchCampaignDetail(pagination.page, pagination.pageSize, true);
      } catch (err) {
        console.error('❌ Error removing client:', err);
        throw err;
      }
    },
    
    handleUploadClients: async (file) => {
      try {
        await uploadClients(id, file);
        lastFetchRef.current.timestamp = 0;
        fetchCampaignDetail(1, pagination.pageSize, true);
      } catch (err) {
        console.error('❌ Error uploading clients:', err);
        throw err;
      }
    },
    
    handleSendCampaign: async () => {
      try {
        setSendingInProgress(true);
        setSnackbarMessage("🚀 Iniciando envío de campaña...");
        setSnackbarSeverity("info");
        setSnackbarOpen(true);

        const response = await sendCampaignMessages(id);

        if (response.success) {
          const { campaign, status, timing } = response;
          
          const successMessage = `🎉 ${response.message}

📋 Campaña: ${campaign.name}
👥 Destinatarios: ${campaign.recipients} clientes
📊 Estado: ${status.current}
⏱️ Tiempo estimado: ${timing.estimated}

💡 ${status.description}
🔄 Los mensajes se están enviando automáticamente en segundo plano`;

          setSnackbarMessage(successMessage);
          setSnackbarSeverity("success");
          
          setCampaignStats({
            campaignId: campaign.id,
            campaignName: campaign.name,
            totalRecipiuseEffectents: campaign.recipients,
            status: status.current,
            estimatedTime: timing.estimated,
            startedAt: new Date().toISOString()
          });

          setTimeout(() => {
            lastFetchRef.current.timestamp = 0;
            fetchCampaignDetail(pagination.page, pagination.pageSize, true);
          }, 2000);

        } else {
          throw new Error(response.message || "Error desconocido en el envío");
        }

        setSnackbarOpen(true);

      } catch (err) {
        console.error("Error en envío de campaña:", err);
        
        let errorMessage = "❌ Error al iniciar el envío de campaña";
        
        if (err.message.includes("timeout")) {
          errorMessage = "⏱️ Timeout al iniciar envío\n💡 La campaña podría haberse iniciado correctamente";
        } else if (err.message.includes("network")) {
          errorMessage = "🌐 Error de conexión\n🔄 Verifica tu conexión a internet";
        } else {
          errorMessage = `❌ Error al iniciar envío:\n${err.message}`;
        }

        setSnackbarMessage(errorMessage);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } finally {
        setSendingInProgress(false);
      }
    },
    
    snackbar: (
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={sendingInProgress ? null : 8000}
        onClose={() => !sendingInProgress && setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ maxWidth: '500px' }}
      >
        <Alert
          onClose={() => !sendingInProgress && setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{
            width: "100%",
            '& .MuiAlert-message': {
              whiteSpace: 'pre-line',
              fontSize: '14px',
              lineHeight: 1.4
            }
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    ),
    campaignStats,
    sendingInProgress
  };
};

export default useCampaignDetail;