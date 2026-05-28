import { BrowserRouter, Routes, Route } from "react-router-dom";
import Ventas from "./pages/Ventas/index.jsx";
import InicioPage from "./pages/Inicio/index.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InicioPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
