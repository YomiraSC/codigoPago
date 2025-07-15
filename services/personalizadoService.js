const API = "/api/personalizado";

export const personalizadoService = {
  getRecords: async () => {
    const res = await fetch(API);
    if (!res.ok) throw new Error("No se pudieron cargar los envíos");
    return res.json();
  },
  getTemplates: async () => {
    // reutiliza tu campaignService
    const res = await fetch("/api/templates");
    if (!res.ok) throw new Error("No se pudieron cargar templates");
    return res.json();
  },
  createSingleSend: async ({ celular, template_id }) => {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ celular, template_id }),
    });
    if (!res.ok) throw new Error("Error al crear envío");
    return res.json();
  },
  sendSingle: async (temporalId) => {
    const res = await fetch(`/api/personalizado/${temporalId}/send`, { method: "POST" });
    if (!res.ok) throw new Error("Error al enviar mensaje");
    return res.json();
  },
};

export default personalizadoService;
