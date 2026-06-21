import api from "./index.js";

export const getProductos = (params) => api.get("/productos", { params });
export const createProducto = (data) => api.post("/productos", data);
export const getProductoById = (id) => api.get(`/productos/${id}`);
export const getTarifasAlquiler = () => api.get("/tarifas-alquiler");
