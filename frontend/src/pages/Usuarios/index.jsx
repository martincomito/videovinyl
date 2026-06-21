import { useState, useEffect } from "react";
import BarraSuperior from "../../components/BarraSuperior/BarraSuperior";
import MenuLateral from "../../components/MenuLateral/MenuLateral";
import Lista from "../../components/Lista/Lista";
import ModalAnadirUsuario from "../../components/Modal/ModalAnadirUsuario";
import ModalEditarUsuario from "../../components/Modal/ModalEditarUsuario";
import ModalMetodosPago from "../../components/Modal/ModalMetodosPago";
import { Settings, Pencil, CreditCard } from "lucide-react";
import "../../styles/variables.scss";
import { getUsuarios } from "../../api/usuarios.js";
import useDebouncedValue from "../../hooks/useDebouncedValue.js";

const transformar = (u) => ({
  id: u.id,
  nombre: `${u.nombre} ${u.apellido}`,
  email: u.email,
  rol: u.rol.charAt(0).toUpperCase() + u.rol.slice(1),
  estado: u.estado === "activo",
  _nombre: u.nombre,
  _apellido: u.apellido,
  _email: u.email,
  _rol: u.rol,
  _estado: u.estado,
  _avatar: u.avatar || "",
});

function UsuariosPage() {
  const [datos, setDatos] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalMetodosPago, setModalMetodosPago] = useState(false);
  const [usuarioParaEditar, setUsuarioParaEditar] = useState(null);
  const [version, setVersion] = useState(0);

  const busquedaDebounced = useDebouncedValue(busqueda, 500);

  useEffect(() => {
    const handler = () => setVersion((v) => v + 1);
    window.addEventListener('usuario-actualizado', handler);
    return () => window.removeEventListener('usuario-actualizado', handler);
  }, []);

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
  }, [pagina, busquedaDebounced, version]);

  const columnas = [
    { key: "id", label: "ID" },
    {
      key: "nombre",
      label: "Nombre",
      render: (valor, fila) => (
        <div className="flex items-center gap-2.5">
          {fila._avatar ? (
            <img
              src={fila._avatar}
              alt=""
              className="w-7 h-7 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-semibold text-slate-500">
                {(fila._nombre[0] || "").toUpperCase()}
                {(fila._apellido[0] || "").toUpperCase()}
              </span>
            </div>
          )}
          <span>{valor}</span>
        </div>
      ),
    },
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
          className="flex items-center gap-1 rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50 cursor-pointer text-slate-600"
          onClick={() => setUsuarioParaEditar(fila)}
        >
          <Pencil size={12} />
          Editar
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

            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-1.5 rounded-md border border-[var(--color-lista-borde)] bg-white px-4 py-2 text-xs font-medium text-[var(--color-texto-primario)] hover:bg-slate-50 cursor-pointer"
                onClick={() => setModalMetodosPago(true)}
              >
                <CreditCard size={13} />
                Métodos de pago
              </button>
              <button
                className="rounded-md bg-[var(--color-boton-primario)] px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
                onClick={() => setModalAbierto(true)}
              >
                + Añadir Usuario
              </button>
            </div>
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
      <ModalMetodosPago
        isOpen={modalMetodosPago}
        onClose={() => setModalMetodosPago(false)}
      />
      <ModalAnadirUsuario
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onSuccess={() => setVersion((v) => v + 1)}
      />
      <ModalEditarUsuario
        isOpen={usuarioParaEditar !== null}
        onClose={() => setUsuarioParaEditar(null)}
        onSuccess={() => {}}
        usuario={usuarioParaEditar}
      />
    </>
  );
}

export default UsuariosPage;
