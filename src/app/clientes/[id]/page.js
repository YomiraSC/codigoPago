"use client";
import { useParams } from "next/navigation";
import { useClienteDetalle } from "@/hooks/useClienteDetalle";
import { Typography, Box, Tabs, Tab, Divider } from "@mui/material";
import ConversationModal from "@/app/components/ConversationModal";
import { useState } from "react";

export default function ClienteDetallePage() {
  const { id } = useParams();
  const {
    cliente,
    loading,
    conversationData,
    conversationLoading,
    selectedConversation,
    setSelectedConversation,
    loadConversacion,
  } = useClienteDetalle(id);

  const [tab, setTab] = useState(0);

  if (loading) return <Typography sx={{ color: "black" }}>Cargando cliente...</Typography>;
  if (!cliente) return <Typography sx={{ color: "black" }}>No se encontró el cliente.</Typography>;

  return (
    <Box p={4}>
      {/* Encabezado con el nombre del cliente */}
      <Typography variant="h4" sx={{ color: "black" }}>{cliente.nombre}</Typography>
      <Typography variant="subtitle1" sx={{ color: "black" }}>Teléfono: {cliente.telefono}</Typography>

      {/* Pestañas de navegación */}
      <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
        <Tab label="Información General" sx={{ color: "black" }} />
        <Tab label="Conversaciones" sx={{ color: "black" }} onClick={loadConversacion} />
        <Tab label="Citas" sx={{ color: "black" }} />
        <Tab label="Pagos" sx={{ color: "black" }} />
      </Tabs>

      {/* Contenido de cada pestaña */}
      {tab === 0 && (
        <Box mt={3}>
          <Typography variant="h6" sx={{ color: "black" }}>Información General</Typography>
          <Divider sx={{ my: 1, backgroundColor: "black" }} />
          <Typography sx={{ color: "black" }}><strong>Documento de Identidad:</strong> {cliente.documento || "No registrado"}</Typography>
          <Typography sx={{ color: "black" }}><strong>Última Interacción:</strong> {cliente.ultima_interaccion || "No disponible"}</Typography>
          <Typography sx={{ color: "black" }}><strong>Última Interacción con el Bot:</strong> {cliente.ultima_interaccion_bot || "No disponible"}</Typography>
          <Typography sx={{ color: "black" }}><strong>Tipo de Cliente:</strong> {cliente.tipo_cliente || "No especificado"}</Typography>
          <Typography sx={{ color: "black" }}><strong>Categoría No Interés:</strong> {cliente.categoria_no_interes || "N/A"}</Typography>
          <Typography sx={{ color: "black" }}><strong>Observaciones:</strong> {cliente.observaciones || "Sin observaciones"}</Typography>
        </Box>
      )}

      {/* Modal de Conversaciones */}
      {tab === 1 && (
        <ConversationModal
          open={true}
          conversationData={conversationData}
          conversationLoading={conversationLoading}
          selectedConversation={selectedConversation}
          setSelectedConversation={setSelectedConversation}
          onClose={() => setTab(0)}
        />
      )}
    </Box>
  );
}
