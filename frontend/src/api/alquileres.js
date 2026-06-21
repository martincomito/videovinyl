import api from "./index.js";

export const getAlquileres = (params) => api.get("/alquileres", { params });
