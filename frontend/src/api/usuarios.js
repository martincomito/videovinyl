import api from "./index.js";

export const getUsuarios = (params) => api.get("/usuarios", { params });
export const createUsuario = (data) => api.post("/usuarios", data);
export const updateUsuario = (id, data) => api.put(`/usuarios/${id}`, data);
export const deleteUsuario = (id) => api.delete(`/usuarios/${id}`);
export const cambiarPassword = (nuevaPassword) => api.put("/usuarios/cambiar-password", { nuevaPassword });
