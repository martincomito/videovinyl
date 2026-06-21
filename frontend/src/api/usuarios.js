import api from "./index.js";

export const getUsuarios = (params) => api.get("/usuarios", { params });
