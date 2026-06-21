import { Navigate, Outlet } from "react-router-dom";

function AdminRoute() {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  return usuario?.rol === "admin" ? <Outlet /> : <Navigate to="/" replace />;
}

export default AdminRoute;
