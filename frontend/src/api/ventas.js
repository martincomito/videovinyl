import api from "./index.js";

export const getVentas = (params) => api.get("/ventas", { params });
export const getVentaById = (id) => api.get(`/ventas/${id}`);
export const createVenta = (data) => api.post("/ventas", data);
