import { blue, green, orange, red, grey, yellow } from '@mui/material/colors';

export const scoreMapping = {
  "Baja": {
    text: "Baja",
    color: red[100],
    textColor: red[800]
  },
  "Alta": {
    text: "Alta",
    color: green[100],
    textColor: green[800]
  },
  "Media": {
    text: "Media",
    color: blue[100],
    textColor: blue[800]
  },
  "no_score": {
    text: "Sin Score",
    color: yellow[100],
    textColor: yellow[800]
  },
  default: {
    text: "Desconocido",
    color: grey[100],
    textColor: grey[800]
  }
};

export const getScoreInfo = (score) => {
  return scoreMapping[score] || scoreMapping.default;
};
