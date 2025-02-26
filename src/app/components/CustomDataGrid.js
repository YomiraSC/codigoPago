"use client";
import { DataGrid } from "@mui/x-data-grid";

export default function CustomDataGrid({ rows, columns, totalRows, pagination, setPagination, sortModel, setSortModel }) {
  return (
    

    <div className="bg-white p-4 rounded-md shadow-md mt-6">
      <DataGrid
        rows={rows}
        columns={columns}
        pagination
        paginationMode="server"
        rowCount={totalRows}
        pageSizeOptions={[5, 10, 20, 50]} // 🔹 Opciones de filas por página
        paginationModel={{
          page: pagination.page - 1, // 🔹 DataGrid usa base 0
          pageSize: pagination.pageSize,
        }}
        onPaginationModelChange={({ page, pageSize }) => {
          setPagination((prev) => ({ ...prev, page: page + 1, pageSize })); // 🔹 Reactualiza el estado de paginación
        }}
        sortingMode="server"
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        autoHeight
      />
    </div>
  );
}
