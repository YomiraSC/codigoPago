"use client";
import { useClientes } from "@/hooks/useClientes";
import ClientesFilters from "../components/ClientesFilters";
import CustomDataGrid from "../components/CustomDataGrid";
import { columnsClientes } from "@/constants/columnsClientes";
import { Typography } from "@mui/material";
import Container from "@mui/material";
import ActionComercialModal from "../components/ActionComercialModal";

export default function ClientesPage() {
  const { clientes, totalClientes, loading, filters, setFilters, pagination, setPagination, sortModel, setSortModel, openModal, cliente, handleAccionComercial, handleClose, guardarAccionComercial } = useClientes();

  return (


    <main className="p-4 max-w-6xl mx-auto">

      <Typography variant="h4" gutterBottom sx={{ color: "#1A202C" }}>
        Clientes
      </Typography>
      <ClientesFilters filters={filters} setFilters={setFilters} />
      {loading ? <p>Cargando...</p> : <CustomDataGrid rows={clientes} columns={columnsClientes(handleAccionComercial)} totalRows={totalClientes} pagination={pagination} setPagination={setPagination} sortModel={sortModel} setSortModel={setSortModel} />}
      <ActionComercialModal
        open={openModal}
        onClose={handleClose}
        cliente={cliente}
        onSave={guardarAccionComercial}
      />
    </main >

  );
}
