import api from "./index.js";

export const getUsuarios = (params) => api.get("/usuarios", { params });
export const createUsuario = (data) => api.post("/usuarios", data);
