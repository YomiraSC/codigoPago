import { blue, green, orange, red, grey, yellow } from '@mui/material/colors';

export const stateMapping = {
  "no interesado": {
    text: "Interesado con Reservas",
    color: red[100],
    textColor: red[800]
  },
  "activo": {
    text: "Activo",
    color: green[100],
    textColor: green[800]
  },
  "seguimiento": {
    text: "Seguimiento",
    color: blue[100],
    textColor: blue[800]
  },
  "interesado": {
    text: "Interesado",
    color: yellow[100],
    textColor: yellow[800]
  },
  "promesas de pago": {
    text: "Promesa de pago",
    color: orange[100],
    textColor: orange[800]
  },
  "cita agendada": {
    text: "Cita Agendada",
    color: green[200],
    textColor: green[800]
  },
  "nuevo": {
    text: "Nuevo",
    color: grey[100],
    textColor: grey[800]
  },
  "promesa_pago_cancelada": {
    text: "Promesa de pago cancelada",
    color: red[100],
    textColor: red[800]
  },
  default: {
    text: "Desconocido",
    color: grey[100],
    textColor: grey[800]
  }
};

export const getStateInfo = (state) => {
  return stateMapping[state] || stateMapping.default;
};
