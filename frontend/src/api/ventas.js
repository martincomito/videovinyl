import api from "./index.js";

export const getVentas = (params) => api.get("/ventas", { params });
export const createVenta = (data) => api.post("/ventas", data);
