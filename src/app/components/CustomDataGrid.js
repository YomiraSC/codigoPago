// "use client";
// import { DataGrid } from "@mui/x-data-grid";

// export default function CustomDataGrid({ rows, columns, totalRows, pagination, setPagination, sortModel, setSortModel }) {
//   return (
    

//     <div className="bg-white p-4 rounded-md shadow-md mt-6">
//       <DataGrid
//         rows={rows}
//         columns={columns}
//         pagination
//         paginationMode="server"
//         rowCount={totalRows}
//         pageSizeOptions={[5, 10, 20, 50]} // 🔹 Opciones de filas por página
//         paginationModel={{
//           page: pagination.page - 1, // 🔹 DataGrid usa base 0
//           pageSize: pagination.pageSize,
//         }}
//         onPaginationModelChange={({ page, pageSize }) => {
//           setPagination((prev) => ({ ...prev, page: page + 1, pageSize })); // 🔹 Reactualiza el estado de paginación
//         }}
//         sortingMode="server"
//         sortModel={sortModel}
//         onSortModelChange={setSortModel}
//         autoHeight
//       />
//     </div>
//   );
// }
"use client";
import { DataGrid } from "@mui/x-data-grid";

export default function CustomDataGrid({
  rows,
  columns,
  totalRows,
  pagination,
  setPagination,
  sortModel,
  setSortModel,
}) {
  // ¿Tenemos paginación server? Sólo si vienen estos props definidos
  const serverPaging = Boolean(pagination && setPagination);
  const serverSorting = Boolean(sortModel && setSortModel);

  return (
    <div className="bg-white p-4 rounded-md shadow-md mt-6">
      <DataGrid
        rows={rows}
        columns={columns}

        // paginación según modo
        pagination={serverPaging}
        paginationMode={serverPaging ? "server" : "client"}
        //rowCount={serverPaging ? totalRows : rows.length}
        {...(serverPaging ? { rowCount: totalRows } : {})}
        pageSizeOptions={[5, 10, 20, 50]}

        // sólo si es server, proporcionamos el modelo
        paginationModel={
          serverPaging
            ? { page: pagination.page - 1, pageSize: pagination.pageSize }
            : undefined
        }
        onPaginationModelChange={
          serverPaging
            ? ({ page, pageSize }) =>
                setPagination((prev) => ({
                  ...prev,
                  page: page + 1,
                  pageSize,
                }))
            : undefined
        }

        // sorting análogo
        sortingMode={serverSorting ? "server" : "client"}
        sortModel={serverSorting ? sortModel : undefined}
        onSortModelChange={
          serverSorting ? (newModel) => setSortModel(newModel) : undefined
        }

        autoHeight
        // cualquier otra prop común
      />
    </div>
  );
}

