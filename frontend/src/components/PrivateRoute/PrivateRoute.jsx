import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import ModalCambiarPassword from "../Modal/ModalCambiarPassword";

function PrivateRoute() {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const [debeCambiar, setDebeCambiar] = useState(!!usuario.debe_cambiar_password);

  return (
    <>
      <Outlet />
      {debeCambiar && (
        <ModalCambiarPassword onExito={() => setDebeCambiar(false)} />
      )}
    </>
  );
}

export default PrivateRoute;
