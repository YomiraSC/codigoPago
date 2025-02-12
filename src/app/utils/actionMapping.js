import { blue, green, orange, red, grey } from '@mui/material/colors';

export const actionMapping = {
  cita_agendada: {
    text: "Cita Agendada",
    color: green[100],
    textColor: green[800]
  },
  volver_contactar: {
    text: "Volver a Contactar",
    color: blue[100],
    textColor: blue[800]
  },
  atendio_otro_lugar: {
    text: "Atendió en Otro Lugar",
    color: orange[100],
    textColor: orange[800]
  },
  no_interesado: {
    text: "No Interesado",
    color: red[100],
    textColor: red[800]
  },
  promesa_de_pago: {
    text: "Promesa de Pago",
    color: orange[100],
    textColor: orange[800],
  },
  default: {
    text: "Sin Acción",
    color: grey[100],
    textColor: grey[800]
  }
};

export const getActionInfo = (action) => {
  return actionMapping[action] || actionMapping.default;
};
