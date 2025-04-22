"use client";
import { Button, Menu, MenuItem, IconButton, Chip } from "@mui/material";
import { useClientes } from "@/hooks/useClientes";
import { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import NuevosFilters from "../components/NuevosFilters";
import { Typography } from "@mui/material"; 
import ConversationModal from "../components/ConversationModal";
import { useRouter } from "next/navigation";


export default function NCPage() {
  const { filters, setFilters } = useClientes();
  const {openConversationModal,conversationData,
    conversationLoading,selectedConversation,
    setSelectedConversation,handleVerConversacion,
    handleCloseConversation,} = useClientes();
  const [nuevasConver, setnuevasConver] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [sortModel, setSortModel] = useState([]);
  const [totalNC, setNC] = useState(0);

    useEffect(() => {
        const fetchNC = async () => {
        setLoading(true);
        try {
            // 1️⃣ Construye los params dinámicamente
            const params = new URLSearchParams({
            page:      pagination.page.toString(),
            pageSize:  pagination.pageSize.toString(),
            orderBy:   sortModel[0]?.field  || 'creado_en',
            order:     sortModel[0]?.sort   || 'asc',
            search:    filters.search       || '',
            // si tienes más filtros: activo: filters.activo || 'Todos', etc.
            });
            if (filters.responded && filters.responded !== "todos") {
              params.append("responded", filters.responded);
            }
            const res = await fetch(`/api/nuevasConver?${params.toString()}`);
            const { clientes, total } = await res.json();

            setnuevasConver(clientes);
            setNC(total);
        } catch (error) {
            console.error("❌ Error al obtener clientes en riesgo:", error);
        } finally {
            setLoading(false);
        }
        };

        fetchNC();
    }, [
        pagination.page,
        pagination.pageSize,
        sortModel[0]?.field,
        sortModel[0]?.sort,
        filters.search,   // 🔔 añadimos la dependencia de búsqueda
        filters.responded
        // si añades otros filtros: filters.activo, filters.tipoCod, etc.
    ]);
  const columns = [
    { field: "nombre", headerName: "Nombre", flex: 1, minWidth: 150 },
    { field: "celular", headerName: "Teléfono", flex: 1, minWidth: 120 },
    {
      field: "acciones",
      headerName: "Conversaciones",
      flex: 1,
      renderCell: (params) => {
        const router = useRouter();
  
        return (
          <Button
              variant="contained"
              onClick={() => {
                console.log("📌 Botón clickeado - nuevo conver ID:", params.row.celular);
                handleVerConversacion(params.row.celular)
              }}
          >
            Ver 
          </Button>
        );
      },
    },
  ];

  return (
    <main className="p-4 max-w-6xl mx-auto">
      <Typography variant="h4" gutterBottom sx={{ color: "#1A202C" }}>
        Filtros
      </Typography>
      <NuevosFilters filters={filters} setFilters={setFilters} />
      <div className="bg-white p-4 rounded-md shadow-md mt-6">
        <DataGrid
          rows={nuevasConver}
          columns={columns}
          paginationMode="server"
          rowCount={totalNC}
          pageSizeOptions={[5, 10, 20, 50]}
          paginationModel={{
            page: pagination.page - 1,
            pageSize: pagination.pageSize,
          }}
          onPaginationModelChange={(newPagination) => {
            setPagination({
              page: newPagination.page + 1,
              pageSize: newPagination.pageSize,
            });
          }}
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          loading={loading}
          getRowId={(row) => row.c_cel}
        />
      </div>
      {/* 🔹 Modal de Conversación */}
            <ConversationModal
              open={openConversationModal}
              onClose={handleCloseConversation}
              conversationLoading={conversationLoading}
              conversationData={conversationData}
              selectedConversation={selectedConversation}
              setSelectedConversation={setSelectedConversation}
            />
    </main>
  );
}
