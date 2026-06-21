import api from "./index.js";

export const getMetodosPago = () => api.get("/metodos-pago");
export const createMetodoPago = (nombre) => api.post("/metodos-pago", { nombre });
export const updateMetodoPago = (id, data) => api.put(`/metodos-pago/${id}`, data);
