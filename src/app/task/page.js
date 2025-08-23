"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useClientes } from '@/hooks/useClientes';
import ActionComercialModal from '@/app/components/ActionComercialModal';
import ConversationModal from '@/app/components/ConversationModal';
import { fetchConversacion } from '../../../services/clientesService';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Box,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Zoom,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Phone as PhoneIcon,
  Payment as PaymentIcon,
  Description as DescriptionIcon,
  ReportProblem as ReportProblemIcon,
  Person as PersonIcon,
  FileDownload as ExportIcon,
  Chat as ChatIcon,
  Call as CallIcon,
  Assignment as AssignmentIcon,
  Today as TodayIcon,
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Configuración de los 2 estados con diseño profesional (colores del home)
const estadosConfig = {
  'Codigo no entregado': {
    titulo: 'Código no Entregado',
    subtitulo: 'Códigos pendientes de entrega',
    icono: <DescriptionIcon />,
    color: '#007391',
    gradiente: 'linear-gradient(135deg, #007391 0%, #005c6b 100%)',
    colorBg: '#e0f7fa',
    descripcion: 'Clientes con códigos de pago pendientes de entrega'
  },
  'duda no resuelta': {
    titulo: 'Duda no Resuelta',
    subtitulo: 'Atención prioritaria requerida',
    icono: <ReportProblemIcon />,
    color: '#d32f2f',
    gradiente: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)',
    colorBg: '#ffebee',
    descripcion: 'Dudas que requieren resolución inmediata'
  }
};

// Componente de Header Profesional
function ProfessionalHeader({ stats, onSearch, onFilter, searchTerm, selectedFilter, currentView, selectedEstado }) {
  const shouldShowSearch = currentView === 'cards' && !selectedEstado;
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        background: 'linear-gradient(135deg, #007391 0%, #005c6b 100%)',
        color: 'white',
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative',
        mb: 4
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          zIndex: 0
        }}
      />
      
      <Box sx={{ p: 4, position: 'relative', zIndex: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center">
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 3, width: 64, height: 64 }}>
              <AssignmentIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5, color: 'white' }}>
                Centro de Tareas
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, color: 'white' }}>
                Sistema integral de gestión comercial
              </Typography>
            </Box>
          </Box>
          <Box textAlign="right">
            <Chip 
              icon={<TodayIcon />}
              label={new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontWeight: 600,
                mb: 1
              }}
            />
            <Typography variant="caption" display="block" sx={{ opacity: 0.8, color: 'white' }}>
              Última actualización: {new Date().toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: 'white' }}>
                {stats.total}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, color: 'white' }}>
                Total Tareas
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: 'white' }}>
                {stats.pendientes}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, color: 'white' }}>
                Pendientes
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: 'white' }}>
                {stats.completadas}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, color: 'white' }}>
                Completadas
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: 'white' }}>
                {Math.round((stats.completadas / stats.total) * 100) || 0}%
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, color: 'white' }}>
                Efectividad
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {false && shouldShowSearch && (
          <Box display="flex" gap={2} alignItems="center">
            <TextField
              placeholder="Buscar por cliente, teléfono o documento..."
              variant="outlined"
              size="medium"
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'rgba(0,0,0,0.4)', mr: 1 }} />,
                sx: { bgcolor: 'white', borderRadius: 2 }
              }}
              sx={{ flex: 1 }}
            />
            <FormControl size="medium" sx={{ minWidth: 200 }}>
              <InputLabel sx={{ color: 'white' }}>Filtrar por estado</InputLabel>
              <Select
                value={selectedFilter}
                onChange={(e) => onFilter(e.target.value)}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.1)', 
                  color: 'white',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.3)'
                  }
                }}
              >
                <MenuItem value="">Todos los estados</MenuItem>
                {Object.entries(estadosConfig).map(([key, config]) => (
                  <MenuItem key={key} value={key}>{config.titulo}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
      </Box>
    </Paper>
  );
}

// Componente mejorado para las tarjetas de resumen de cada estado
function EstadoCard({ estado, generalStats, onSelectEstado, selectedEstado }) {
  const config = estadosConfig[estado];
  const stats = generalStats || { total: 0, pendientes: 0, completados: 0 };
  const isSelected = selectedEstado === estado;
  const porcentajeCompletado = stats.total > 0 ? Math.round((stats.completados / stats.total) * 100) : 0;

  return (
    <Zoom in timeout={500}>
      <Card
        elevation={isSelected ? 12 : 4}
        sx={{
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRadius: 3,
          overflow: 'visible',
          position: 'relative',
          height: 280,
          background: isSelected ? config.gradiente : 'white',
          color: isSelected ? 'white' : '#254e59',
          transform: isSelected ? 'translateY(-8px)' : 'none',
          '&:hover': {
            transform: 'translateY(-4px)',
            elevation: 8
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: config.gradiente,
            borderRadius: '12px 12px 0 0'
          }
        }}
        onClick={() => onSelectEstado(isSelected ? '' : estado)}
      >
        <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar 
              sx={{ 
                bgcolor: isSelected ? 'rgba(255,255,255,0.2)' : config.colorBg,
                color: isSelected ? 'white' : config.color,
                mr: 2,
                width: 56,
                height: 56
              }}
            >
              {config.icono}
            </Avatar>
            <Box flex={1}>
              <Typography variant="h7" sx={{ fontWeight: 700, mb: 0.5, color: 'inherit' }}>
                {config.titulo}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: isSelected ? 0.9 : 0.7,
                  fontSize: '0.875rem',
                  color: 'inherit'
                }}
              >
                {config.subtitulo}
              </Typography>
            </Box>
          </Box>
          
          {/* Métricas principales */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box textAlign="center">
              <Typography variant="h3" sx={{ fontWeight: 'bold', lineHeight: 1, color: 'inherit' }}>
                {stats.pendientes}
              </Typography>
              <Typography variant="caption" sx={{ opacity: isSelected ? 0.9 : 0.7, color: 'inherit' }}>
                Pendientes
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h3" sx={{ fontWeight: 'bold', lineHeight: 1, color: isSelected ? '#81c784' : '#4caf50' }}>
                {stats.completados}
              </Typography>
              <Typography variant="caption" sx={{ opacity: isSelected ? 0.9 : 0.7, color: 'inherit' }}>
                Completados
              </Typography>
            </Box>
          </Box>

          {/* Barra de progreso */}
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'inherit' }}>
                Progreso
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'inherit' }}>
                {porcentajeCompletado}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={porcentajeCompletado} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                bgcolor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: isSelected ? '#81c784' : config.color,
                  borderRadius: 4
                }
              }}
            />
          </Box>

          {/* Footer con total */}
          <Box mt="auto">
            <Chip
              label={`${stats.total} tareas totales`}
              size="small"
              sx={{
                bgcolor: isSelected ? 'rgba(255,255,255,0.2)' : config.colorBg,
                color: isSelected ? 'white' : config.color,
                fontWeight: 600,
                width: '100%'
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Zoom>
  );
}

// Componente para la tarjeta especial de envío de mensajes
function EnvioMensajeCard({ onOpenModal, mensajesStats }) {
  const stats = mensajesStats || { enviados: 0 };

  return (
    <Zoom in timeout={500}>
      <Card
        elevation={4}
        sx={{
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRadius: 3,
          overflow: 'visible',
          position: 'relative',
          height: 280,
          background: 'white',
          color: '#254e59',
          '&:hover': {
            transform: 'translateY(-4px)',
            elevation: 8
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
            borderRadius: '12px 12px 0 0'
          }
        }}
        onClick={onOpenModal}
      >
        <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar 
              sx={{ 
                bgcolor: '#e8f5e8',
                color: '#2e7d32',
                mr: 2,
                width: 56,
                height: 56
              }}
            >
              <SendIcon />
            </Avatar>
            <Box flex={1}>
              <Typography variant="h7" sx={{ fontWeight: 700, mb: 0.5, color: 'inherit' }}>
                Envío de Mensajes
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.7,
                  fontSize: '0.875rem',
                  color: 'inherit'
                }}
              >
                Mensajes personalizados
              </Typography>
            </Box>
          </Box>
          
          {/* Métrica principal - Solo Enviados */}
          <Box display="flex" justifyContent="center" alignItems="center" mb={3}>
            <Box textAlign="center">
              <Typography variant="h1" sx={{ fontWeight: 'bold', lineHeight: 1, color: '#2e7d32', fontSize: '3rem' }}>
                {stats.enviados}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'inherit', mt: 1 }}>
                Mensajes Enviados
              </Typography>
            </Box>
          </Box>

          {/* Contenido descriptivo */}
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" flex={1} mb={2}>
            <Typography variant="body2" sx={{ opacity: 0.8, textAlign: 'center', px: 2, lineHeight: 1.5 }}>
              Envía un mensaje con plantilla personalizada
            </Typography>
          </Box>

          {/* Footer */}
          <Box mt="auto">
            <Chip
              label="Hacer clic para enviar mensaje"
              size="small"
              sx={{
                bgcolor: '#e8f5e8',
                color: '#2e7d32',
                fontWeight: 600,
                width: '100%'
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Zoom>
  );
}

// Modal para envío de mensajes
function EnvioMensajeModal({ open, onClose, onSuccess }) {
  const [celular, setCelular] = useState('');
  const [codigo, setCodigo] = useState('');
  const [clienteEncontrado, setClienteEncontrado] = useState(null);
  const [plantillas, setPlantillas] = useState([]);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Cargar plantillas al abrir el modal
  useEffect(() => {
    if (open) {
      cargarPlantillas();
    }
  }, [open]);

  const cargarPlantillas = async () => {
    try {
      const response = await fetch('/api/plantillas');
      if (response.ok) {
        const data = await response.json();
        setPlantillas(data || []);
      }
    } catch (error) {
      console.error('Error cargando plantillas:', error);
    }
  };

  const buscarCliente = async () => {
    if (!celular.trim()) {
      setMensaje({ tipo: 'error', texto: 'Por favor ingresa un número de celular' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/bigquery/cliente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          telefono: celular.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.clientes && data.clientes.length > 0) {
          const clienteEncontrado = data.clientes[0];
          setClienteEncontrado(clienteEncontrado);
          
          // Mostrar información de gestión
          const tipoGestion = clienteEncontrado.gestion || 'No definida';
          setMensaje({ 
            tipo: 'success', 
            texto: `Cliente encontrado. Gestión: ${tipoGestion}${tipoGestion === 'convencional' ? ' (Solo se registrará acción)' : ' (Se enviará mensaje)'}` 
          });
        } else {
          setClienteEncontrado(null);
          setMensaje({ tipo: 'warning', texto: 'No se encontró cliente con ese número' });
        }
      } else {
        setMensaje({ tipo: 'error', texto: 'Error al buscar cliente' });
      }
    } catch (error) {
      console.error('Error buscando cliente:', error);
      setMensaje({ tipo: 'error', texto: 'Error de conexión al buscar cliente' });
    } finally {
      setLoading(false);
    }
  };

  const enviarMensaje = async () => {
    if (!clienteEncontrado) {
      setMensaje({ tipo: 'error', texto: 'Primero debes buscar y encontrar un cliente' });
      return;
    }
    
    const tipoGestion = clienteEncontrado.gestion || 'convencional';
    
    // Para gestión retadora, validar plantilla
    if (tipoGestion === 'retadora' && !plantillaSeleccionada) {
      setMensaje({ tipo: 'error', texto: 'Para gestión retadora debe seleccionar una plantilla' });
      return;
    }
    
    if (!codigo.trim()) {
      setMensaje({ tipo: 'error', texto: 'Ingresa el código para la plantilla' });
      return;
    }

    setEnviando(true);
    try {
      const requestBody = {
        tipo: 'personalizado',
        cliente: {
          celular: clienteEncontrado.telefono_principal || clienteEncontrado.celular,
          nombre: clienteEncontrado.nombre_completo || clienteEncontrado.nombre
        },
        variables: {
          codigo: codigo.trim()
        },
        gestion: tipoGestion
      };

      // Solo incluir template_id para gestión retadora
      if (tipoGestion === 'retadora') {
        requestBody.template_id = plantillaSeleccionada;
      }

      const response = await fetch('/api/envio_individual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const result = await response.json();
        
        if (tipoGestion === 'convencional') {
          setMensaje({ 
            tipo: 'success', 
            texto: 'Acción comercial registrada exitosamente (gestión convencional)' 
          });
        } else {
          setMensaje({ 
            tipo: 'success', 
            texto: 'Mensaje enviado y acción comercial registrada (gestión retadora)' 
          });
        }
        
        // Recargar estadísticas de mensajes si se proporcionó callback
        if (onSuccess) {
          await onSuccess();
        }
        
        // Limpiar formulario después de envío exitoso
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        const errorData = await response.json();
        setMensaje({ tipo: 'error', texto: errorData.error || 'Error al procesar solicitud' });
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      setMensaje({ tipo: 'error', texto: 'Error de conexión al enviar mensaje' });
    } finally {
      setEnviando(false);
    }
  };

  const handleClose = () => {
    setCelular('');
    setCodigo('');
    setClienteEncontrado(null);
    setPlantillaSeleccionada('');
    setMensaje({ tipo: '', texto: '' });
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 2 }}>
          <Box display="flex" alignItems="center">
            <SendIcon sx={{ mr: 2, color: '#2e7d32' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Envío de Mensaje
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 2 }}>
          <Grid container spacing={2}>
            {/* Sección: Buscar Cliente */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: '#254e59' }}>
                  Buscar Cliente
                </Typography>
                <Box display="flex" gap={1} alignItems="center">
                  <TextField
                    label="Número de Celular"
                    value={celular}
                    onChange={(e) => setCelular(e.target.value)}
                    placeholder="573001234567"
                    fullWidth
                    size="small"
                    variant="outlined"
                  />
                  <Button
                    variant="contained"
                    onClick={buscarCliente}
                    disabled={loading}
                    size="small"
                    sx={{ 
                      bgcolor: '#007391',
                      minWidth: 100,
                      '&:hover': { bgcolor: '#005c6b' }
                    }}
                  >
                    {loading ? <CircularProgress size={16} color="inherit" /> : 'Buscar'}
                  </Button>
                </Box>
                
                {clienteEncontrado && (
                  <Box mt={1.5} p={2} sx={{ bgcolor: '#f8f9fa', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32', mb: 1 }}>
                      Cliente Encontrado
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Nombre:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {clienteEncontrado.nombre_completo || clienteEncontrado.nombre}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Celular:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {clienteEncontrado.telefono_principal || clienteEncontrado.celular}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Documento:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {clienteEncontrado.documento || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Gestión:</Typography>
                        <Box>
                          <Chip 
                            label={clienteEncontrado.gestion || 'No definida'}
                            size="small"
                            sx={{ 
                              bgcolor: clienteEncontrado.gestion === 'retadora' ? '#ffebee' : '#e8f5e8',
                              color: clienteEncontrado.gestion === 'retadora' ? '#d32f2f' : '#2e7d32',
                              fontWeight: 600,
                              fontSize: '0.75rem'
                            }}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                    {clienteEncontrado.gestion === 'convencional' && (
                      <Typography variant="caption" sx={{ color: '#666', display: 'block', mt: 1 }}>
                        Solo se registrará la acción comercial
                      </Typography>
                    )}
                    {clienteEncontrado.gestion === 'retadora' && (
                      <Typography variant="caption" sx={{ color: '#666', display: 'block', mt: 1 }}>
                        Se enviará mensaje y registrará acción comercial
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Sección: Seleccionar Plantilla - Solo para gestión retadora */}
            {(!clienteEncontrado || clienteEncontrado.gestion === 'retadora') && (
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: '#254e59' }}>
                    Plantilla {clienteEncontrado?.gestion === 'retadora' ? '(Requerido)' : '(Opcional)'}
                  </Typography>
                  {clienteEncontrado?.gestion === 'convencional' && (
                    <Alert severity="info" sx={{ mb: 1, py: 0.5 }}>
                      No se requiere plantilla para gestión convencional
                    </Alert>
                  )}
                  <FormControl fullWidth size="small" disabled={clienteEncontrado?.gestion === 'convencional'}>
                    <InputLabel>Seleccionar Plantilla</InputLabel>
                    <Select
                      value={plantillaSeleccionada}
                      onChange={(e) => setPlantillaSeleccionada(e.target.value)}
                      label="Seleccionar Plantilla"
                    >
                    {plantillas.map((plantilla) => (
                      <MenuItem key={plantilla.id} value={plantilla.id}>
                        {plantilla.nombre_template}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {/* Vista previa compacta */}
                {plantillaSeleccionada && (
                  <Box mt={1} p={1.5} sx={{ bgcolor: '#f8f9fa', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#254e59', mb: 0.5, display: 'block' }}>
                      Vista previa:
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#666', lineHeight: 1.4 }}>
                      {(() => {
                        const plantilla = plantillas.find(p => p.id === plantillaSeleccionada);
                        if (!plantilla) return '';
                        
                        let mensaje = plantilla.mensaje || '';
                        mensaje = mensaje.replace(/\{\{nombre\}\}/g, clienteEncontrado?.nombre_completo || clienteEncontrado?.nombre || '[NOMBRE]');
                        mensaje = mensaje.replace(/\{\{codigo\}\}/g, codigo || '[CÓDIGO]');
                        mensaje = mensaje.replace(/\{\{1\}\}/g, codigo || '[CÓDIGO]');
                        
                        return mensaje;
                      })()}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
            )}

            {/* Sección: Código */}
            <Grid item xs={12}>
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: '#254e59' }}>
                  Código
                </Typography>
                <TextField
                  label="Código para el mensaje"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="Ingresa el código"
                  fullWidth
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={handleClose} size="small" sx={{ color: '#666' }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={enviarMensaje}
            size="small"
            disabled={
              enviando || 
              !clienteEncontrado || 
              !codigo.trim() ||
              (clienteEncontrado?.gestion === 'retadora' && !plantillaSeleccionada)
            }
            sx={{ 
              bgcolor: '#2e7d32',
              '&:hover': { bgcolor: '#1b5e20' }
            }}
          >
            {enviando ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              clienteEncontrado?.gestion === 'convencional' 
                ? 'Registrar Acción' 
                : 'Enviar Mensaje'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para mensajes */}
      <Snackbar
        open={!!mensaje.texto}
        autoHideDuration={4000}
        onClose={() => setMensaje({ tipo: '', texto: '' })}
      >
        <Alert
          onClose={() => setMensaje({ tipo: '', texto: '' })}
          severity={mensaje.tipo}
          sx={{ width: '100%' }}
        >
          {mensaje.texto}
        </Alert>
      </Snackbar>
    </>
  );
}

// Componente de tabla con paginación del servidor
function TasksTable({ tasks, onAccionComercial, onVerConversacion, pagination, onChangePage, onChangeRowsPerPage, page, rowsPerPage }) {
  return (
    <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#007391' }}>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Cliente</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Teléfono</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Documento</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Estado</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Gestor Asignado</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Fecha Creación</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Estado Tarea</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{task.cliente}</TableCell>
                <TableCell>{task.telefono}</TableCell>
                <TableCell>{task.documento}</TableCell>
                <TableCell>
                  <Chip
                    label={estadosConfig[task.estado]?.titulo || task.estado}
                    size="small"
                    sx={{
                      bgcolor: estadosConfig[task.estado]?.colorBg || '#f5f5f5',
                      color: estadosConfig[task.estado]?.color || '#666',
                      fontWeight: 600
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ width: 32, height: 32, mr: 1, fontSize: '0.875rem' }}>
                      {task.gestor?.charAt(0) || 'N'}
                    </Avatar>
                    <Typography variant="body2">{task.gestor}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{task.fechaCreacion}</TableCell>
                <TableCell>
                  {task.llamado ? (
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="Completado"
                      size="small"
                      sx={{ bgcolor: '#e8f5e8', color: '#2e7d2e', fontWeight: 600 }}
                    />
                  ) : (
                    <Chip
                      icon={<CallIcon />}
                      label="Pendiente"
                      size="small"
                      sx={{ bgcolor: '#fff3e0', color: '#f57c00', fontWeight: 600 }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Tooltip title="Ver conversación">
                      <IconButton
                        size="small"
                        onClick={() => onVerConversacion(task.id)}
                        sx={{ color: '#007391' }}
                      >
                        <ChatIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={task.llamado ? "Completado" : "Realizar llamada"}>
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => onAccionComercial(task)}
                          disabled={task.llamado}
                          sx={{ 
                            color: task.llamado ? '#4caf50' : '#007391',
                            '&.Mui-disabled': {
                              color: '#4caf50'
                            }
                          }}
                        >
                          {task.llamado ? <CheckCircleIcon fontSize="small" /> : <CallIcon fontSize="small" />}
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={pagination?.totalItems || 0}
        page={page}
        onPageChange={onChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        sx={{
          bgcolor: '#f8f9fa',
          borderTop: '1px solid #dee2e6',
          '& .MuiTablePagination-toolbar': {
            color: '#254e59'
          },
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
            fontWeight: 600
          }
        }}
      />
    </Paper>
  );
}

// Toolbar profesional mejorado
function ProfessionalToolbar({ onExport, stats, onViewChange, currentView }) {
  return (
    <Box 
      display="flex" 
      justifyContent="space-between" 
      alignItems="center" 
      mb={4}
      sx={{ 
        p: 3, 
        bgcolor: 'white', 
        borderRadius: 3, 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
      }}
    >
      {/*<Box>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#254e59', mb: 0.5 }}>
          Gestión de Tareas Comerciales
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Administra y realiza seguimiento a todas las actividades comerciales
        </Typography>
      </Box>*/}
      
      {/*
        <Box display="flex" gap={2} alignItems="center">
       {<Button
          variant="outlined"
          startIcon={<ExportIcon />}
          onClick={onExport}
          sx={{ 
            borderRadius: 2,
            borderColor: '#007391',
            color: '#007391',
            '&:hover': {
              borderColor: '#005c6b',
              bgcolor: '#f0f8ff'
            }
          }}
        >
          Exportar
        </Button>}
      </Box>
      */}
    </Box>
  );
}

export default function TasksPage() {
  // Estados principales
  const [selectedEstado, setSelectedEstado] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openConversationModal, setOpenConversationModal] = useState(false);
  const [openEnvioMensajeModal, setOpenEnvioMensajeModal] = useState(false);
  const [conversationData, setConversationData] = useState(null);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [currentView, setCurrentView] = useState('cards');
  
  // Estados para paginación y carga
  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  // Estados para estadísticas
  const [generalStats, setGeneralStats] = useState({
    'Codigo no entregado': { total: 0, pendientes: 0, completados: 0 },
    'duda no resuelta': { total: 0, pendientes: 0, completados: 0 }
  });
  const [mensajesStats, setMensajesStats] = useState({
    enviados: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  
  const { data: session } = useSession();
  const { gestores, handleSaveCliente } = useClientes();

  // Función para cargar estadísticas generales
  const loadGeneralStats = async () => {
    setLoadingStats(true);
    try {
      const response = await fetch('/api/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estados: Object.keys(estadosConfig) })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('📊 Estadísticas recibidas:', data);
          
          // Actualizar las estadísticas con los datos recibidos del API
          setGeneralStats(data.metricas || {});
        }
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Función para cargar estadísticas de mensajes
  const loadMensajesStats = async () => {
    try {
      const response = await fetch('/api/task', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMensajesStats({
            enviados: data.mensajesEnviados || 0
          });
        }
      }
    } catch (error) {
      console.error('Error cargando estadísticas de mensajes:', error);
    }
  };

  // Función para cargar tareas de un estado específico
  const loadTasks = async (estado, currentPage = 0, limit = 10, search = '') => {
    if (!estado) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        estado,
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(search && { search })
      });

      console.log('🔍 Cargando tareas con parámetros:', { estado, currentPage, limit, search });
      const response = await fetch(`/api/task?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('✅ Tareas cargadas:', data.data.length, 'elementos');
          setTasks(data.data);
          setPagination(data.pagination);
        } else {
          console.error('❌ Error en la respuesta:', data.error);
          setTasks([]);
        }
      } else {
        console.error('❌ Error HTTP:', response.status, await response.text());
        setTasks([]);
      }
    } catch (error) {
      console.error('❌ Error cargando tareas:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar estadísticas al montar el componente
  useEffect(() => {
    loadGeneralStats();
    loadMensajesStats();
  }, []);

  // Efecto para cargar tareas cuando cambia el estado seleccionado
  useEffect(() => {
    if (selectedEstado && currentView === 'detailed') {
      loadTasks(selectedEstado, page, rowsPerPage, searchTerm);
    }
  }, [selectedEstado, currentView, page, rowsPerPage, searchTerm]);

  // Función para cambiar vista y resetear estados de navegación
  const handleViewChange = (newView) => {
    setCurrentView(newView);
    if (newView === 'cards') {
      setSelectedEstado('');
      setSearchTerm('');
      setFilterEstado('');
      setTasks([]);
    }
    setPage(0);
  };

  // Función para seleccionar estado y cambiar a vista detallada
  const handleSelectEstado = (estado) => {
    if (estado === selectedEstado) {
      setSelectedEstado('');
      setCurrentView('cards');
      setTasks([]);
    } else {
      setSelectedEstado(estado);
      setCurrentView('detailed');
    }
    setPage(0);
  };

  // Función para volver a vista resumen
  const handleBackToCards = () => {
    setCurrentView('cards');
    setSelectedEstado('');
    setSearchTerm('');
    setFilterEstado('');
    setTasks([]);
    setPage(0);
  };

  // Función para abrir modal de acción comercial
  const handleAccionComercial = (task) => {
    setSelectedClient({
      id: task.id,
      nombre: task.cliente,
      celular: task.telefono,
      email: task.email,
      documento: task.documento,
      gestor: task.gestor,
      observacion: task.observacion
    });
    setOpenModal(true);
  };

  // Función para cerrar modal de acción comercial
  const handleClose = () => {
    setOpenModal(false);
    setSelectedClient(null);
  };

  // Función para ver conversación
  const handleVerConversacion = async (clienteId) => {
    setConversationLoading(true);
    setOpenConversationModal(true);

    try {
      const data = await fetchConversacion(clienteId);
      setConversationData(data);
    } catch (error) {
      console.error("Error al obtener la conversación:", error);
      setConversationData(null);
    } finally {
      setConversationLoading(false);
    }
  };

  // Función para cerrar modal de conversación
  const handleCloseConversation = () => {
    setOpenConversationModal(false);
    setConversationData(null);
    setSelectedConversation(0);
  };

  // Función personalizada para guardar cliente y marcar tarea como llamada
  const handleSaveClienteAndMarkTask = async (clienteData) => {
    try {
      // Primero guardar en la base de datos usando el hook
      await handleSaveCliente(clienteData);
      
      // Recargar las tareas para reflejar los cambios
      const currentPageNum = page + 1;
      await loadTasks(selectedEstado, currentPageNum, rowsPerPage, searchTerm);
      
      // Recargar estadísticas generales
      await loadGeneralStats();
      
      handleClose();
    } catch (error) {
      console.error("Error al guardar cliente:", error);
    }
  };

  // Funciones para manejo de búsqueda y filtros
  const handleSearch = (term) => {
    setSearchTerm(term);
    setPage(0); // Resetear página cuando se busca
  };

  const handleFilter = (estado) => {
    setFilterEstado(estado);
    setPage(0); // Resetear página cuando se filtra
  };

  // Funciones de paginación actualizadas
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };


  // Calcular estadísticas para el header
  const stats = useMemo(() => {
    const allStats = Object.values(generalStats);
    const total = allStats.reduce((sum, stat) => sum + stat.total, 0);
    const completadas = allStats.reduce((sum, stat) => sum + stat.completados, 0);
    const pendientes = total - completadas;
    return { total, completadas, pendientes };
  }, [generalStats]);

  return (
    <Container maxWidth="xl" sx={{ py: 4, position: 'relative' }}>
      {/* Loading profesional para estadísticas */}
      {loadingStats && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(248, 250, 252, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(2px)',
            borderRadius: 2
          }}
        >
          <Box
            sx={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 3,
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 8px 32px rgba(0, 115, 145, 0.15)',
              maxWidth: 350,
              textAlign: 'center',
              border: '1px solid rgba(0, 115, 145, 0.1)'
            }}
          >
            <CircularProgress 
              size={60} 
              thickness={4}
              sx={{ 
                color: '#007391',
                mb: 2,
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round'
                }
              }} 
            />
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#254e59', 
                fontWeight: 600,
                mb: 1
              }}
            >
              Cargando Métricas
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#64748b',
                fontWeight: 400,
                lineHeight: 1.5
              }}
            >
              Obteniendo estadísticas actualizadas...
            </Typography>
            <Box
              sx={{
                width: '80%',
                height: 3,
                bgcolor: 'rgba(0, 115, 145, 0.1)',
                borderRadius: 2,
                mt: 2,
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  width: '40%',
                  height: '100%',
                  bgcolor: '#007391',
                  borderRadius: 2,
                  animation: 'loading-slide 1.8s ease-in-out infinite',
                  '@keyframes loading-slide': {
                    '0%': { transform: 'translateX(-100%)', width: '40%' },
                    '50%': { transform: 'translateX(0%)', width: '60%' },
                    '100%': { transform: 'translateX(150%)', width: '40%' }
                  }
                }}
              />
            </Box>
          </Box>
        </Box>
      )}

      {/* Header profesional */}
      <ProfessionalHeader 
        stats={stats}
        onSearch={handleSearch}
        onFilter={handleFilter}
        searchTerm={searchTerm}
        selectedFilter={filterEstado}
        currentView={currentView}
        selectedEstado={selectedEstado}
      />

      {/* Toolbar profesional */}
      {/*<ProfessionalToolbar 
        onExport={handleExport}
        stats={stats}
        onViewChange={handleViewChange}
        currentView={currentView}
      />*/}

      {/* Vista de tarjetas de estados */}
      {currentView === 'cards' && !selectedEstado && (
        <Grid container spacing={4} sx={{ mb: 4, justifyContent: 'center' }}>
          {Object.keys(estadosConfig).map(estado => (
            <Grid item xs={12} md={6} lg={4} key={estado}>
              <EstadoCard
                estado={estado}
                generalStats={generalStats[estado]}
                onSelectEstado={handleSelectEstado}
                selectedEstado={selectedEstado}
              />
            </Grid>
          ))}
          {/* Tarjeta especial para envío de mensajes */}
          <Grid item xs={12} md={6} lg={4}>
            <EnvioMensajeCard 
              onOpenModal={() => setOpenEnvioMensajeModal(true)} 
              mensajesStats={mensajesStats}
            />
          </Grid>
        </Grid>
      )}

      {/* Vista detallada */}
      {(currentView === 'detailed' || selectedEstado) && selectedEstado && (
        <Box>
          {/* Breadcrumb para navegación */}
          <Box display="flex" alignItems="center" mb={3}>
            <Button
              variant="outlined"
              onClick={handleBackToCards}
              startIcon={<ArrowBackIcon />}
              sx={{ 
                mr: 2,
                borderColor: '#007391',
                color: '#007391',
                '&:hover': {
                  borderColor: '#005c6b',
                  bgcolor: '#f0f8ff'
                }
              }}
            >
              Volver a Estados
            </Button>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#254e59' }}>
              / {estadosConfig[selectedEstado]?.titulo}
            </Typography>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress size={60} sx={{ color: '#007391' }} />
            </Box>
          ) : (
            <TasksTable
              tasks={tasks}
              onAccionComercial={handleAccionComercial}
              onVerConversacion={handleVerConversacion}
              pagination={pagination}
              onChangePage={handleChangePage}
              onChangeRowsPerPage={handleChangeRowsPerPage}
              page={page}
              rowsPerPage={rowsPerPage}
            />
          )}
        </Box>
      )}

      {/* Modales */}
      <ActionComercialModal
        open={openModal}
        onClose={handleClose}
        cliente={selectedClient}
        onSave={handleSaveClienteAndMarkTask}
        gestores={gestores}
      />

      <ConversationModal
        open={openConversationModal}
        onClose={handleCloseConversation}
        conversationLoading={conversationLoading}
        conversationData={conversationData}
        selectedConversation={selectedConversation}
        setSelectedConversation={setSelectedConversation}
      />

      <EnvioMensajeModal
        open={openEnvioMensajeModal}
        onClose={() => setOpenEnvioMensajeModal(false)}
        onSuccess={loadMensajesStats}
      />
    </Container>
  );
}
