import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

// Agrega el token JWT a cada request saliente si el usuario está logueado
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el servidor rechaza la sesión, limpia el token y manda al login
    // Excluir el endpoint de login para que el formulario pueda mostrar el error de credenciales
    if (
      error.response?.status === 401 &&
      !error.config.url.includes("/auth/login")
    ) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
