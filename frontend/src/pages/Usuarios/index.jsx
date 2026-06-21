import { useState, useEffect } from "react";
import BarraSuperior from "../../components/BarraSuperior/BarraSuperior";
import MenuLateral from "../../components/MenuLateral/MenuLateral";
import Lista from "../../components/Lista/Lista";
import { Settings } from "lucide-react";
import "../../styles/variables.scss";
import { getUsuarios } from "../../api/usuarios.js";
import useDebouncedValue from "../../hooks/useDebouncedValue.js";

const transformar = (u) => ({
  id: u.id,
  nombre: `${u.nombre} ${u.apellido}`,
  email: u.email,
  rol: u.rol.charAt(0).toUpperCase() + u.rol.slice(1),
  estado: u.estado === "activo",
});

function UsuariosPage() {
  const [datos, setDatos] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);

  const busquedaDebounced = useDebouncedValue(busqueda, 500);

  useEffect(() => {
    setPagina(1);
  }, [busquedaDebounced]);

  useEffect(() => {
    setCargando(true);
    getUsuarios({ pagina, limite: 10, q: busquedaDebounced || undefined })
      .then(({ data }) => {
        setDatos(data.datos.map(transformar));
        setTotal(data.total);
      })
      .catch(console.error)
      .finally(() => setCargando(false));
  }, [pagina, busquedaDebounced]);

  const columnas = [
    { key: "id", label: "ID" },
    { key: "nombre", label: "Nombre" },
    { key: "email", label: "Email" },
    {
      key: "rol",
      label: "Rol",
      render: (valor) => (
        <span className="rounded bg-slate-100 px-2 py-1 text-xs">{valor}</span>
      ),
    },
    {
      key: "estado",
      label: "Estado",
      render: (valor) => (
        <div
          className={`h-2 w-2 rounded-full ${valor ? "bg-green-500" : "bg-gray-400"}`}
        />
      ),
    },
    {
      key: "acciones",
      label: "Acciones",
      render: (_, fila) => (
        <button
          className="flex items-center gap-1 rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
          onClick={() => console.log("Gestionar usuario:", fila.id)}
        >
          Gestionar Permisos
        </button>
      ),
    },
  ];

  return (
    <>
      <BarraSuperior />

      <div className="flex h-[calc(100vh-50px)] bg-[var(--color-fondo-paginas-primario)]">
        <MenuLateral />

        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Settings size={18} className="text-[var(--color-primario)]" />
                <h1 className="text-lg font-semibold text-[var(--color-texto-primario)]">
                  Configuración de Usuarios
                </h1>
              </div>
              <p className="mt-1 text-xs text-[var(--color-texto-secundario)]">
                Administra el acceso y roles de los empleados del sistema.
              </p>
            </div>

            <button
              className="rounded-md bg-[var(--color-boton-primario)] px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
            >
              + Añadir Usuario
            </button>
          </div>

          <Lista
            columnas={columnas}
            datos={datos}
            mostrarBuscador
            totalRegistros={total}
            paginaActual={pagina}
            onCambioPagina={setPagina}
            textoBusqueda={busqueda}
            onCambioBusqueda={setBusqueda}
            cargando={cargando}
          />
        </main>
      </div>
    </>
  );
}

export default UsuariosPage;
