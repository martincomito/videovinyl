import { useState, useEffect } from "react";
import BarraSuperior from "../../components/BarraSuperior/BarraSuperior";
import MenuLateral from "../../components/MenuLateral/MenuLateral";
import Lista from "../../components/Lista/Lista";
import { CalendarClock } from "lucide-react";
import "../../styles/variables.scss";
import { getAlquileres } from "../../api/alquileres.js";
import useDebouncedValue from "../../hooks/useDebouncedValue.js";

const ESTADOS = { activo: "Activo", devuelto: "Devuelto", vencido: "Atrasado" };

const transformar = (a) => ({
  id: a.id,
  codigo: a.id,
  clienteNombre: `${a.cliente.nombre} ${a.cliente.apellido}`,
  producto: a.producto.titulo,
  fechaRetiro: a.fecha_inicio,
  fechaVencimiento: a.fecha_devolucion_esperada,
  estado: ESTADOS[a.estado] ?? a.estado,
});

function AlquileresPage() {
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
    getAlquileres({ pagina, limite: 10, q: busquedaDebounced || undefined })
      .then(({ data }) => {
        setDatos(data.datos.map(transformar));
        setTotal(data.total);
      })
      .catch(console.error)
      .finally(() => setCargando(false));
  }, [pagina, busquedaDebounced]);

  const columnas = [
    { key: "codigo", label: "ID" },
    { key: "clienteNombre", label: "Cliente" },
    { key: "producto", label: "Producto" },
    {
      key: "fechaRetiro",
      label: "Retiro",
      render: (valor) => valor.split("-").reverse().join("-"),
    },
    {
      key: "fechaVencimiento",
      label: "Vencimiento",
      render: (valor) => valor.split("-").reverse().join("-"),
    },
    {
      key: "estado",
      label: "Estado",
      render: (valor) => {
        const clases = {
          Atrasado: "bg-red-100 text-red-600",
          Activo: "bg-green-100 text-green-700",
          Devuelto: "bg-teal-100 text-teal-700",
        };
        return (
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${clases[valor] ?? "bg-slate-100 text-slate-600"}`}
          >
            {valor}
          </span>
        );
      },
    },
    {
      key: "acciones",
      label: "Acciones",
      render: (_, fila) =>
        fila.estado !== "Devuelto" ? (
          <button
            className="flex items-center gap-1 rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50 cursor-pointer"
            onClick={() => console.log("Devolver:", fila.id)}
          >
            Devolver
          </button>
        ) : (
          <span className="text-xs text-slate-400">Completado</span>
        ),
    },
  ];

  return (
    <>
      <BarraSuperior />

      <div className="flex bg-[var(--color-fondo-paginas-primario)] h-[calc(100vh-50px)]">
        <MenuLateral />

        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CalendarClock size={18} className="text-[var(--color-primario)]" />
                <h1 className="text-lg font-semibold text-[var(--color-texto-primario)]">
                  Alquileres
                </h1>
              </div>
              <p className="mt-1 text-xs text-[var(--color-texto-secundario)]">
                Gestiona préstamos y devoluciones de videos.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-1 rounded-md border border-[var(--color-lista-borde)]
                  bg-white px-4 py-2 text-xs font-medium text-[var(--color-texto-primario)]
                  hover:bg-slate-50 cursor-pointer"
              >
                Registrar Devolución
              </button>
              <button
                className="flex items-center gap-1 rounded-md bg-[var(--color-boton-primario)]
                  px-4 py-2 text-xs font-medium text-white hover:opacity-90 cursor-pointer"
              >
                + Nuevo Alquiler
              </button>
            </div>
          </div>

          <Lista
            columnas={columnas}
            datos={datos}
            mostrarBuscador
            placeholderBuscador="Buscar por Cliente, DNI o Producto..."
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

export default AlquileresPage;
