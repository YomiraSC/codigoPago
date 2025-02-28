"use client";

import { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import bcrypt from "bcryptjs";

export default function UsuariosPage() {
  const [usuariosModificados, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [sortModel, setSortModel] = useState([]);  
  const [totalUsuarios, setTotalUsuarios] = useState(0);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        
        const res = await fetch("/api/usuarios");
        // const data = await res.json();
        // setUsuarios(data);
        const { usuariosModificados, total } = await res.json(); // ✅ Leer ambos valores
      
        setUsuarios(usuariosModificados);
        setTotalUsuarios(total);

      } catch (error) {
        console.error("❌ Error al obtener usuarios:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsuarios();
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
    { field: "username", headerName: "Usuario", flex: 1, minWidth: 150 },
    {
        field: "nombre_completo",
        headerName: "Nombre Completo",
        flex: 1.5,
        minWidth: 200,
        renderCell: (params) => {
          const persona = params.row?.persona;
      
          if (!persona) return <span style={{ color: "gray" }}>Desconocido</span>; // Muestra un texto en gris si no hay datos
      
          return (
            <span>
              {persona.nombre || ""} {persona.primer_apellido || ""} {persona.segundo_apellido || ""}
            </span>
          );
        }
      }
      ,
      {
        field: "celular",
        headerName: "Celular",
        flex: 1,
        minWidth: 120,
        renderCell: (params) => params.row?.persona?.celular || "No disponible"
      }
      ,
      {
        field: "nombre_rol",
        headerName: "Rol",
        flex: 1,
        minWidth: 120,
        renderCell: (params) => params.row?.rol?.nombre_rol || "No disponible"
      },
    { field: "activo", headerName: "Estado", flex: 1, minWidth: 100 },
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
      <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
          Crear Usuario
      </Button> 
      <div className="bg-white p-4 rounded-md shadow-md mt-6">
        
        <DataGrid
          rows={usuariosModificados}
          columns={columns}
          pagination
          paginationMode="server"
          rowCount={totalUsuarios}
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

function UsuarioModal({ open, onClose, onSave, user, userRole }) {
    const [formData, setFormData] = useState({
      nombre: user?.persona?.nombre || "",
      primer_apellido: user?.persona?.primer_apellido || "",
      segundo_apellido: user?.persona?.segundo_apellido || "",
      celular: user?.persona?.celular || "",
      username: user?.username || "",
      password: "", // No cargamos la contraseña existente
      rol_id: user?.rol?.rol_id || "",
      activo: user ? Number(user.activo) : 1,
    });
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };
  
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>{user ? "Editar Usuario" : "Crear Usuario"}</DialogTitle>
        <DialogContent>
          <TextField name="nombre" label="Nombre" value={formData.nombre} onChange={handleChange} fullWidth margin="dense" required />
          <TextField name="primer_apellido" label="Primer Apellido" value={formData.primer_apellido} onChange={handleChange} fullWidth margin="dense" required />
          <TextField name="segundo_apellido" label="Segundo Apellido" value={formData.segundo_apellido} onChange={handleChange} fullWidth margin="dense" />
          <TextField name="celular" label="Celular" value={formData.celular} onChange={handleChange} fullWidth margin="dense" />
          <TextField name="username" label="Usuario" value={formData.username} onChange={handleChange} fullWidth margin="dense" required />
  
          {/* Solo los Administradores pueden cambiar la contraseña */}
          {(
            <TextField name="password" label="Nueva Contraseña" type="password" value={formData.password} onChange={handleChange} fullWidth margin="dense" />
          )}
  
          <FormControl fullWidth margin="dense">
            <InputLabel>Rol</InputLabel>
            <Select name="rol_id" value={formData.rol_id} onChange={handleChange} required>
              <MenuItem value="1">Administrador</MenuItem>
              <MenuItem value="2">Usuario</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">Guardar</Button>
        </DialogActions>
      </Dialog>
    );
  }
  