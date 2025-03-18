"use client";
import { useClientes } from "@/hooks/useClientes";
import { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import ClientesFilters from "../components/ClientesFilters";
import { Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import bcrypt from "bcryptjs";

export default function CRPage() {
    const {filters,setFilters} = useClientes();
  const [clientesRiesgo, setClientesRiesgo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [sortModel, setSortModel] = useState([]);  
  const [totalCR, setCR] = useState(0);

  useEffect(() => {
    const fetchCR= async () => {
      try {
        
        const res = await fetch("/api/clientesRiesgo");
        // const data = await res.json();
        // setUsuarios(data);
        const { clientesTransformadosR, total } = await res.json(); // ✅ Leer ambos valores
      
        setClientesRiesgo(clientesTransformadosR);
        setCR(total);

      } catch (error) {
        console.error("❌ Error al obtener usuarios:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCR();
  }, [loading]);

  const handleOpenModal = (user = null) => {
    setEditingUser(user);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setEditingUser(null);
    setOpenModal(false);
  };

  const handleSave = async (userData) => {
    const method = editingUser ? "PUT" : "POST";
    const url = editingUser ? `/api/usuarios/${editingUser.usuario_id}` : "/api/usuarios";
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "x-user-role": "Usuario",
        },
        body: JSON.stringify({
          ...userData,
          rol_id: Number(userData.rol_id), // 🔹 Convertimos rol_id antes de enviarlo
          activo: userData.activo !== undefined ? Number(userData.activo) : 1,
        }),
      });
  
      const newUser = await res.json(); // Obtener el usuario con el ID generado
  
      if (!res.ok) throw new Error(newUser.error || "Error en la operación");
  
      setOpenModal(false);
      setEditingUser(null);
  
      setUsuarios((prev) =>
        editingUser
          ? prev.map((u) => (u.usuario_id === newUser.usuario_id ? newUser : u)) // Actualizar usuario editado
          : [...prev, newUser] // Agregar usuario nuevo con ID asignado
      );
      if (!editingUser) {
        setTotalUsuarios((prevTotal) => prevTotal + 1); // 🔹 Aumenta totalUsuarios
      }
    } catch (error) {
      console.error("❌ Error al guardar usuario:", error);
    }
  };
  
  

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;
  
    try {
      const res = await fetch(`/api/usuarios/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (res.ok) {
        setUsuarios((prev) => prev.filter((usuario) => usuario.usuario_id !== id));
        setTotalUsuarios((prevTotal) => prevTotal - 1); // 🔹 Reduce el total de usuarios
      } else {
        const errorData = await res.json();
        console.error("❌ Error al eliminar usuario:", errorData.error);
        alert(errorData.error);
      }
    } catch (error) {
      console.error("❌ Error en la eliminación:", error);
    }
  };
  
  
  
  

  const columns = [
    { field: "documento_identidad", headerName: "DNI", flex: 1, minWidth: 120 },
  //{ field: "nombre", headerName: "Nombre", flex: 1, minWidth: 150 },
  { field: "nombreCompleto", headerName: "Nombre", flex: 1, minWidth: 150 },

  
  
  { field: "celular", headerName: "Teléfono", flex: 1, minWidth: 120 },
  { field: "tipo_codigo", headerName: "Tipo de Código", flex: 1, minWidth: 120},
  { field: "codigo_pago", headerName: "Código", flex: 1, minWidth: 120},
  { field: "fecha_vencimiento", headerName: "Fecha de vencimiento", flex: 1, minWidth: 120},
    {
      field: "acciones",
      headerName: "Acciones",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => handleOpenModal(params.row)} color="primary">
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row.usuario_id)} color="error">
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <main className="p-4 max-w-6xl mx-auto">
          <Typography variant="h4" gutterBottom sx={{ color: "#1A202C" }}>
            Filtros
          </Typography>
          
          {/* 🔹 Filtros de búsqueda */}
          <ClientesFilters filters={filters} setFilters={setFilters} />
          
          <div className="bg-white p-4 rounded-md shadow-md mt-6">
                  
                  <DataGrid
                    rows={clientesRiesgo}
                    columns={columns}
                    pagination
                    paginationMode="server"
                    rowCount={setCR}
                    pageSizeOptions={[5, 10, 20, 50]} // 🔹 Opciones de filas por página
                    paginationModel={{
                      page: pagination.page - 1, // 🔹 DataGrid usa base 0
                      pageSize: pagination.pageSize,
                    }}
                    onPaginationModelChange={({ page, pageSize }) => {
                      setPagination((prev) => ({ ...prev, page: page + 1, pageSize })); // 🔹 Reactualiza el estado de paginación
                    }}
                    sortingMode="client"
                    sortModel={sortModel}
                    onSortModelChange={setSortModel}
                    loading={loading}
                    getRowId={(row) => row.usuario_id} 
                  />
                  {openModal && <UsuarioModal open={openModal} onClose={handleCloseModal} onSave={handleSave} user={editingUser} />} 
                </div>
        </main>
    
  );
}

