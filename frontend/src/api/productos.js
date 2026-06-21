import api from "./index.js";

export const getProductos = (params) => api.get("/productos", { params });
