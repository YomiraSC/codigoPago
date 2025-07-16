"use client";
import { useClientes } from "@/hooks/useClientes";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import useCampaignDetail from "@/hooks/useCampaignsDetail";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box, Typography, Button, CircularProgress, Alert, Dialog, DialogTitle, 
  DialogContent, DialogActions, Table, TableHead, TableRow, TableCell, TableBody, 
  Card, CardContent, Divider, IconButton
} from "@mui/material";
import CustomDataGrid from "@/app/components/CustomDataGrid";
import * as XLSX from "xlsx";
import { ArrowBack, UploadFile, Send, Delete } from "@mui/icons-material"; 

const CampaignDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const campaignId = params?.id;
  console.log("idcampagna: ",campaignId);
  const [openModal, setOpenModal] = useState(false);
  const [file, setFile] = useState(null);
  const [clients, setClients] = useState([]);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const fileInputRef = useRef(null);
  const [noPagados, setNoPagados] = useState([]);
  const [paginationNP, setPaginationNP] = useState({ page: 1, pageSize: 10, total: 0 });
  const [showReminder, setShowReminder] = useState(false);
  
  const {filters,setFilters} = useClientes();
    const [clientesRiesgo, setClientesRiesgo] = useState([]);
    const [loading1, setLoading1] = useState(true);
    //const [openModal, setOpenModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    //const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
    const [sortModel, setSortModel] = useState([]);  
    const [totalCR, setCR] = useState(0);
  // const loadNoPagados = async () => {
  //   const { page, pageSize } = paginationNP;
  //   const res = await fetch(`/api/campaigns/${campaignId}/no-pagados?page=${page}&pageSize=${pageSize}`);
  //   const data = await res.json();
  //   if (!data.error) {
  //     setNoPagados(data.clientes);
  //     setPaginationNP(prev => ({ ...prev, total: data.pagination.total }));
  //     setShowReminder(true);
  //   }
  // };
  const loadNoPagados = async () => {
    // 1) Extrae page y pageSize de tu estado de paginación
    const { page, pageSize } = paginationNP;

    // 2) Úsalos en la URL
    const res = await fetch(
      `/api/campaigns/${campaignId}/no-pagados?page=${page}&pageSize=${pageSize}`
    );
    const { clientes, pagination } = await res.json();
    // FILTRO: sólo la primera ocurrencia de cada clienteId
    const seenCel = new Set();
    const unicos = clientes.filter(c => {
      if (seenCel.has(c.celular)) return false;
      seenCel.add(c.celular);
      return true;
    });
    // 3) Mapea para añadir un id único (por ejemplo, clienteId)
    const filasConId = unicos.map((c, idx) => ({
      id: c.cliente_id,      // por ejemplo: el PK de tu cliente
      nombre: c.nombre,
      celular: c.celular,
      // …cualquier otro campo
    }));

    setNoPagados(filasConId);
    setPaginationNP(paginationNP);
    setShowReminder(true);
};


const handleSendReminder = async () => {
  try {
    const res = await fetch(`/api/campaigns/${campaignId}/send-recordatorio`, { method: "POST" });
    const data = await res.json();
    if (data.success) {
      // muévete a un snackbar o alerta
      console.log("Recordatorios enviados:", data.sentMessages);
    }
  } catch (err) {
    console.error(err);
  }
};

  const {
    campaign,
    pagination,
    setPagination,
    clients: campaignClients,
    loading,
    error,
    fetchCampaignDetail,
    handleRemoveClient,
    handleUploadClients,
    handleSendCampaign,
    snackbar,
  } = useCampaignDetail(campaignId);

  // useEffect(() => {
  //   if (campaignId) {
  //     fetchCampaignDetail();
  //   }
  //   console.log("camapla",campaign);
  //   setLoading1(true);
  //   const fetchCR= async () => {
  //       try {
          
  //         const res = await fetch(`/api/clientesRiesgo?page=${pagination.page}&pageSize=${pagination.pageSize}`);
  //         const { clientes, total } = await res.json();
          
  //         console.log("Clientes recibidos:", clientes, "Total:", total);
          
  //         setClientesRiesgo(clientes);
  //         setCR(total);
  
  //       } catch (error) {
  //         console.error("❌ Error al obtener usuarios:", error);
  //       } finally {
  //         setLoading1(false);
  //       }
  //     };
  //     fetchCR();
  // }, [campaignId,pagination.page, pagination.pageSize]);
  useEffect(() => {
    if (campaignId) {
      fetchCampaignDetail();
    }
    console.log("camapla",campaign);
  }, [campaignId]);

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      const formattedClients = jsonData.map((row, index) => ({
        id: index + 1,
        numero: row["Numero"],
        nombre: row["Nombre"],
      }));

      setClients(formattedClients);
    };
    reader.readAsArrayBuffer(uploadedFile);
  };

  const handleSaveClients = async () => {
    if (!file) return;
    console.log("pasa handleSaveClients");
    setLoadingUpload(true);
    await handleUploadClients(file);
    setOpenModal(false);
    setFile(null);
    setClients([]);
    fetchCampaignDetail();
    setLoadingUpload(false);
  };

  return (
    <Box p={3} width="100%" maxWidth="1200px" margin="auto" height="100%">
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
          <CircularProgress color="primary" />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          {/* 🔹 ENCABEZADO */}
          <Box textAlign="center" mb={3} p={2} sx={{ bgcolor: "#007391", color: "white", borderRadius: 2 }}>
            <Typography variant="h4" fontWeight="bold">📢 {campaign?.nombre_campanha}</Typography>
          </Box>

          {/* 🔹 INFORMACIÓN DE LA CAMPAÑA */}
          <Card sx={{ bgcolor: "white", boxShadow: 2, mt: 2, p: 2 }}>
            <CardContent>
              <Typography variant="h6" color="#007391">📋 Información de la Campaña</Typography>
              <Divider sx={{ my: 1, backgroundColor: "#005c6b" }} />
              <Typography><strong>📄 Descripción:</strong> {campaign?.descripcion || "Sin descripción"}</Typography>
              <Typography><strong>📅 Fecha de Creación:</strong> {campaign?.fecha_creacion ? new Date(campaign.fecha_creacion).toLocaleDateString() : "N/A"}</Typography>
              <Typography><strong>⏳ Fecha Fin:</strong> {campaign?.fecha_fin ? new Date(campaign.fecha_fin).toLocaleDateString() : "No definida"}</Typography>
              <Typography><strong>🔘 Estado:</strong> {campaign?.estado_campanha || "Desconocido"}</Typography>
              <Typography><strong>👥 Número de Clientes:</strong> {pagination.total}</Typography>
              <Typography><strong>📝 Template:</strong> {campaign?.template?.nombre_template || "No asignado"}</Typography>
              <Typography><strong>📝 Mensaje:</strong> {campaign?.template?.mensaje || "No definido"}</Typography>
            </CardContent>
          </Card>

          <Divider sx={{ my: 3 }} />

          {/* 🔹 BOTONES DE ACCIÓN */}
          <Box display="flex" justifyContent="space-between" my={2}>
            <Button
              variant="contained"
              onClick={() => router.push("/campaigns")}
              sx={{ backgroundColor: "#254e59", "&:hover": { backgroundColor: "#1a363d" } }}
              startIcon={<ArrowBack />}
            >
              Volver
            </Button>
            <Button
              variant="contained"
              onClick={() => setOpenModal(true)}
              sx={{ backgroundColor: "#007391", "&:hover": { backgroundColor: "#005c6b" } }}
              startIcon={<UploadFile />}
            >
              Subir Clientes desde Excel
            </Button>
            <Button
              variant="contained"
              sx={{ backgroundColor: "#007391", "&:hover": { backgroundColor: "#005c6b" } }}
              onClick={loadNoPagados}
              startIcon={<UploadFile />}
            >
              Cargar no pagados
            </Button>

            {showReminder && (
              <Button
                variant="contained"
                sx={{ backgroundColor: "#f57c00", "&:hover": { backgroundColor: "#ef6c00" } }}
                onClick={handleSendReminder}
                startIcon={<Send />}
              >
                Enviar Recordatorio
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleSendCampaign}
              sx={{ backgroundColor: "#388e3c", "&:hover": { backgroundColor: "#00600f" } }}
              startIcon={<Send />}
            >
              Enviar Mensajes
            </Button>
          </Box>

          {/* 🔹 TABLA DE CLIENTES */}
          <CustomDataGrid
            pagination={pagination}
            setPagination={setPagination}
            getRowId={row => row.celular}
            // rows={campaignClients}
            // totalRows={pagination.total}
            rows={ showReminder ? noPagados : campaignClients }
            totalRows={ showReminder ? paginationNP.total : pagination.total }
            columns={[
              //{ field: "id", headerName: "ID Cliente", flex: 1 },
              { field: "nombre", headerName: "Nombre", flex: 1 },
              { field: "celular", headerName: "Celular", flex: 1 },
              //{ field: "gestor", headerName: "Gestor", flex: 1 },
              {
                field: "acciones",
                headerName: "Acciones",
                flex: 1,
                renderCell: (params) => (
                  <IconButton
                    onClick={() => handleRemoveClient(params.row.id)}
                    sx={{ color: "#D32F2F" }}
                  >
                    <Delete />
                  </IconButton>
                ),
              },
            ]}
          />

          {/* 🔹 MODAL DE CARGA DE CLIENTES */}
          <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
            <DialogTitle>Subir Clientes desde Excel</DialogTitle>
            <DialogContent>
              <input ref={fileInputRef} type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenModal(false)} color="primary">Cerrar</Button>
              {file && (
                <Button color="primary" variant="contained" onClick={handleSaveClients}>
                  Subir Clientes
                </Button>
              )}
            </DialogActions>
          </Dialog>

          {snackbar}

          {/* 🔹 SPINNER DE CARGA */}
          {loadingUpload && (
            <Box sx={{
              position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex",
              justifyContent: "center", alignItems: "center", zIndex: 9999,
            }}>
              <CircularProgress size={60} color="primary" />
            </Box>
          )}
        </>
      )}
    </Box>
  );
  //const columns = [
    //{ field: "id_contrato", headerName: "ID Contrato", flex: 1, minWidth: 120 },
    // { field: "documento_identidad", headerName: "DNI", flex: 1, minWidth: 120 },
    // { field: "nombreCompleto", headerName: "Nombre", flex: 1, minWidth: 150 },
    // { field: "celular", headerName: "Teléfono", flex: 1, minWidth: 120 },
    //{ field: "tipo_codigo", headerName: "Tipo de Código", flex: 1, minWidth: 120 },
    //{ field: "codigo_pago", headerName: "Código", flex: 1, minWidth: 120 },
    //{ field: "fecha_vencimiento", headerName: "Fecha de vencimiento", flex: 1, minWidth: 120 },
    //{ field: "pago_realizado", headerName: "Estado de Pago", flex: 1, minWidth: 120 },
  //];
  // return (
  //   <Box p={3} width="100%" maxWidth="1200px" margin="auto" height="100%">
  //     {loading ? (
  //       <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
  //         <CircularProgress color="primary" />
  //       </Box>
  //     ) : error ? (
  //       <Alert severity="error">{error}</Alert>
  //     ) : (
  //       <>
  //         {/* 🔹 ENCABEZADO */}
  //         <Box textAlign="center" mb={3} p={2} sx={{ bgcolor: "#007391", color: "white", borderRadius: 2 }}>
  //           <Typography variant="h4" fontWeight="bold">📢 {campaign?.nombre_campanha}</Typography>
  //         </Box>

  //         {/* 🔹 INFORMACIÓN DE LA CAMPAÑA */}
  //         <Card sx={{ bgcolor: "white", boxShadow: 2, mt: 2, p: 2 }}>
  //           <CardContent>
  //             <Typography variant="h6" color="#007391">📋 Información de la Campaña</Typography>
  //             <Divider sx={{ my: 1, backgroundColor: "#005c6b" }} />
  //             <Typography><strong>📄 Descripción:</strong> {campaign?.descripcion || "Sin descripción"}</Typography>
  //             <Typography><strong>📅 Fecha de Creación:</strong> {campaign?.fecha_creacion ? new Date(campaign.fecha_creacion).toLocaleDateString() : "N/A"}</Typography>
  //             <Typography><strong>⏳ Fecha Fin:</strong> {campaign?.fecha_fin ? new Date(campaign.fecha_fin).toLocaleDateString() : "No definida"}</Typography>
  //             <Typography><strong>🔘 Estado:</strong> {campaign?.estado_campanha || "Desconocido"}</Typography>
  //             <Typography><strong>👥 Número de Clientes:</strong> {pagination.total}</Typography>
  //             <Typography><strong>📝 Template:</strong> {campaign?.template?.nombre_template || "No asignado"}</Typography>
  //             <Typography><strong>📝 Mensaje:</strong> {campaign?.template?.mensaje || "No definido"}</Typography>
  //           </CardContent>
  //         </Card>

  //         <Divider sx={{ my: 3 }} />

  //         {/* 🔹 BOTONES DE ACCIÓN */}
  //         <Box display="flex" justifyContent="space-between" my={2}>
  //           <Button
  //             variant="contained"
  //             onClick={() => router.push("/campaigns")}
  //             sx={{ backgroundColor: "#254e59", "&:hover": { backgroundColor: "#1a363d" } }}
  //             startIcon={<ArrowBack />}
  //           >
  //             Volver
  //           </Button>
  //           {/* <Button
  //             variant="contained"
  //             onClick={() => handleCargarClientes(true)}
  //             sx={{ backgroundColor: "#007391", "&:hover": { backgroundColor: "#005c6b" } }}
  //             startIcon={<UploadFile />}
  //           >
  //             Subir Clientes desde Excel
  //           </Button> */}

  //           <Button
  //             variant="contained"
  //             onClick={handleSaveClients}
  //             sx={{ backgroundColor: "#007391", "&:hover": { backgroundColor: "#005c6b" } }}
  //             startIcon={<UploadFile />}
  //           >
  //             Cargar Clientes
  //           </Button>

  //           <Button
  //             variant="contained"
  //             onClick={handleSendCampaign}
  //             sx={{ backgroundColor: "#388e3c", "&:hover": { backgroundColor: "#00600f" } }}
  //             startIcon={<Send />}
  //           >
  //             Enviar Mensajes
  //           </Button>
  //         </Box>

  //         {/* 🔹 TABLA DE CLIENTES */}
  //         {/* <CustomDataGrid
  //           pagination={pagination}
  //           setPagination={setPagination}
  //           rows={campaignClients}
  //           totalRows={pagination.total}
  //           columns={[
  //             { field: "id_contrato", headerName: "Código Contrato", flex: 1, minWidth: 120 },
  //             { field: "documento_identidad", headerName: "DNI", flex: 1, minWidth: 120 },
  //             { field: "nombreCompleto", headerName: "Nombre", flex: 1, minWidth: 150 },
  //             { field: "celular", headerName: "Teléfono", flex: 1, minWidth: 120 },
  //             { field: "tipo_codigo", headerName: "Tipo de Código", flex: 1, minWidth: 120 },
  //             { field: "codigo_pago", headerName: "Código", flex: 1, minWidth: 120 },
  //             { field: "pago_realizado", headerName: "Estado de Pago", flex: 1, minWidth: 120 },
  //             {
  //               field: "acciones",
  //               headerName: "Acciones",
  //               flex: 1,
  //               renderCell: (params) => (
  //                 <IconButton
  //                   onClick={() => handleRemoveClient(params.row.cliente_id)}
  //                   sx={{ color: "#D32F2F" }}
  //                 >
  //                   <Delete />
  //                 </IconButton>
  //               ),
  //             },
  //           ]}
  //         /> */}
  //         <div className="bg-white p-4 rounded-md shadow-md mt-6">
  //           <DataGrid
  //             rows={campaignClients}
  //             columns={[
  //               { field: "id_contrato", headerName: "Código Contrato", flex: 1, minWidth: 120,
  //                 renderCell: (params) => params.row.codigo_pago ? params.row.codigo_pago.id_contrato : "Sin contrato"
  //               },
  //               { field: "documento_identidad", headerName: "DNI", flex: 1, minWidth: 120 },
  //               { field: "nombreCompleto", headerName: "Nombre", flex: 1, minWidth: 150 },
  //               { field: "celular", headerName: "Teléfono", flex: 1, minWidth: 120 },
  //               { field: "tipo_codigo", headerName: "Tipo de Código", flex: 1, minWidth: 120,
  //                 renderCell: (params) => params.row.codigo_pago ? params.row.codigo_pago.tipo_codigo : "N/A"
  //               },
  //               { field: "codigo", headerName: "Código", flex: 1, minWidth: 120,
  //                 renderCell: (params) => params.row.codigo_pago ? params.row.codigo_pago.codigo : "N/A"
  //               },
  //               { field: "pago_realizado", headerName: "Estado de Pago", flex: 1, minWidth: 120,
  //                 renderCell: (params) => params.row.codigo_pago ? params.row.codigo_pago.pago_realizado : "Pendiente"
  //               },
  //               {
  //                 field: "acciones",
  //                 headerName: "Acciones",
  //                 flex: 1,
  //                 renderCell: (params) => (
  //                   <IconButton
  //                     onClick={() => handleRemoveClient(params.row.cliente_id)}
  //                     sx={{ color: "#D32F2F" }}
  //                   >
  //                     <Delete />
  //                   </IconButton>
  //                 ),
  //               },
  //             ]}
  //             pagination
  //             paginationMode="server"
  //             rowCount={pagination.total}
  //             pageSizeOptions={[5, 10, 20, 50]} // 🔹 Opciones de filas por página
  //             paginationModel={{
  //               page: pagination.page - 1, // 🔹 DataGrid usa base 0
  //               pageSize: pagination.pageSize,
  //             }}
  //             onPaginationModelChange={({ page, pageSize }) => {
  //               setPagination((prev) => ({ ...prev, page: page + 1, pageSize })); // 🔹 Reactualiza el estado de paginación
  //             }}
  //             sortingMode="server"
  //             sortModel={sortModel}
  //             onSortModelChange={setSortModel}
  //             autoHeight
  //           />
  //         </div>
  //         {/* <div className="bg-white p-4 rounded-md shadow-md mt-6">
                            
  //                           <DataGrid
  //                             rows={clientesRiesgo}
  //                             columns={columns}
  //                             pagination
  //                             paginationMode="server"
  //                             rowCount={totalCR}
  //                             pageSizeOptions={[5, 10, 20, 50]} // 🔹 Opciones de filas por página
  //                             paginationModel={{
  //                               page: pagination.page - 1, // 🔹 DataGrid usa base 0
  //                               pageSize: pagination.pageSize,
  //                             }}
  //                             onPaginationModelChange={({ page, pageSize }) => {
  //                               if (pagination.page !== page + 1 || pagination.pageSize !== pageSize) {
  //                                 setPagination((prev) => ({ ...prev, page: page + 1, pageSize }));
  //                               }
  //                             }}
                              
  //                             sortingMode="client"
  //                             sortModel={sortModel}
  //                             onSortModelChange={setSortModel}
  //                             loading={loading}
  //                             getRowId={(row) => row.c_id} 
  //                           />
  //                           {openModal && <UsuarioModal open={openModal} onClose={handleCloseModal} onSave={handleSave} user={editingUser} />} 
  //                         </div> */}

          


  //         {/* 🔹 MODAL DE CARGA DE CLIENTES */}
  //         <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
  //           <DialogTitle>Subir Clientes desde Excel</DialogTitle>
  //           <DialogContent>
  //             <input ref={fileInputRef} type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
  //           </DialogContent>
  //           <DialogActions>
  //             <Button onClick={() => setOpenModal(false)} color="primary">Cerrar</Button>
  //             {file && (
  //               <Button color="primary" variant="contained" onClick={handleSaveClients}>
  //                 Subir Clientes
  //               </Button>
  //             )}
  //           </DialogActions>
  //         </Dialog>

  //         {snackbar}

  //         {/* 🔹 SPINNER DE CARGA */}
  //         {loadingUpload && (
  //           <Box sx={{
  //             position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
  //             backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex",
  //             justifyContent: "center", alignItems: "center", zIndex: 9999,
  //           }}>
  //             <CircularProgress size={60} color="primary" />
  //           </Box>
  //         )}
  //       </>
  //     )}
  //   </Box>
  // );
};

export default CampaignDetailPage;