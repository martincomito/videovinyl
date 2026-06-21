import api from './index.js';

export const getReportes = (fechaInicio, fechaFin) =>
  api.get('/reportes', { params: { fechaInicio, fechaFin } });
