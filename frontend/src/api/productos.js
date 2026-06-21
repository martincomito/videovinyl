import api from "./index.js";

export const getProductos = (params) => api.get("/productos", { params });
export const createProducto = (data) => api.post("/productos", data);
export const getProductoById = (id) => api.get(`/productos/${id}`);
export const getTarifasAlquiler = () => api.get("/tarifas-alquiler");
export const updateProducto = (id, data) => api.put(`/productos/${id}`, data);
export const deleteProducto = (id) => api.delete(`/productos/${id}`);
export const updateTarifaAlquiler = (tipo, precio_por_dia) =>
  api.put(`/tarifas-alquiler/${tipo}`, { precio_por_dia });
