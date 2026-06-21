import api from "./index.js";

export const getPagos = (params) => api.get("/pagos", { params });
export const createPago = (data) => api.post("/pagos", data);
export const getDeudaCliente = (id) => api.get(`/clientes/${id}/deuda`);
