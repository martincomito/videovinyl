import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import InicioPage from "./pages/Inicio/index.jsx";
import VentasPage from "./pages/Ventas/index.jsx";
import AlquileresPage from "./pages/Alquileres/index.jsx";
import InventarioPage from "./pages/Inventario/index.jsx";
import ClientesPage from "./pages/Clientes/index.jsx";
import UsuariosPage from "./pages/Usuarios/index.jsx";
import ReportesPage from "./pages/Reportes/index.jsx";
import LoginPage from "./pages/Login/index.jsx";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute.jsx";
import AdminRoute from "./components/AdminRoute/AdminRoute.jsx";

function App() {
  return (
    <ToastProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<InicioPage />} />
          <Route path="/ventas" element={<VentasPage />} />
          <Route path="/alquileres" element={<AlquileresPage />} />
          <Route path="/inventario" element={<InventarioPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route element={<AdminRoute />}>
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/reportes" element={<ReportesPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
