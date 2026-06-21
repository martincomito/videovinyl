import api from "./index.js";

export const getAlquileres = (params) => api.get("/alquileres", { params });
export const createAlquiler = (data) => api.post("/alquileres", data);
export const getAlquilerById = (id) => api.get(`/alquileres/${id}`);
export const registrarDevolucion = (id, data) => api.put(`/alquileres/${id}/devolucion`, data);
