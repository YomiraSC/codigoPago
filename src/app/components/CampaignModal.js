import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";

const CampaignModal = ({ open, onClose, campaign }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{campaign ? "Editar Campaña" : "Nueva Campaña"}</DialogTitle>
      <DialogContent>
        <TextField label="Nombre de campaña" fullWidth margin="dense" defaultValue={campaign?.nombre} />
        <TextField label="Descripción" fullWidth margin="dense" defaultValue={campaign?.descripcion} />
        <TextField label="Estado" fullWidth margin="dense" defaultValue={campaign?.estado} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Cerrar</Button>
        <Button color="primary" variant="contained">Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CampaignModal;
