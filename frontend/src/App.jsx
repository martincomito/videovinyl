import { BrowserRouter, Routes, Route } from "react-router-dom";
import InicioPage from "./pages/Inicio/index.jsx";
import VentasPage from "./pages/Ventas/index.jsx";
import AlquileresPage from "./pages/Alquileres/index.jsx";
import InventarioPage from "./pages/Inventario/index.jsx";
import ClientesPage from "./pages/Clientes/index.jsx";
import UsuariosPage from "./pages/Usuarios/index.jsx";
import ReportesPage from "./pages/Reportes/index.jsx";
import LoginPage from "./pages/Login/index.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InicioPage />} />
        <Route path="/ventas" element={<VentasPage />} />
        <Route path="/alquileres" element={<AlquileresPage />} />
        <Route path="/inventario" element={<InventarioPage />} />
        <Route path="/clientes" element={<ClientesPage />} />
        <Route path="/usuarios" element={<UsuariosPage />} />
        <Route path="/reportes" element={<ReportesPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
