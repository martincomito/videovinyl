import api from "./index.js";

export const getClientes = (params) => api.get("/clientes", { params });
export const createCliente = (data) => api.post("/clientes", data);
