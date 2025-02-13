"use client";
import { useClientes } from "@/hooks/useClientes";
import ClientesFilters from "../components/ClientesFilters";
import CustomDataGrid from "../components/CustomDataGrid";
import { columnsClientes } from "@/constants/columnsClientes";

export default function ClientesPage() {
  const { clientes, totalClientes, loading, filters, setFilters, pagination, setPagination, sortModel, setSortModel } = useClientes();

  return (
    <main className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Leads</h1>
      <ClientesFilters filters={filters} setFilters={setFilters} />
      {loading ? <p>Cargando...</p> : <CustomDataGrid rows={clientes} columns={columnsClientes} totalRows={totalClientes} pagination={pagination} setPagination={setPagination} sortModel={sortModel} setSortModel={setSortModel} />}
    </main>
  );
}
