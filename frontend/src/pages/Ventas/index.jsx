import { useState, useEffect } from "react";
import BarraSuperior from "../../components/BarraSuperior/BarraSuperior";
import MenuLateral from "../../components/MenuLateral/MenuLateral";
import Lista from "../../components/Lista/Lista";
import ModalNuevaVenta from "../../components/Modal/ModalNuevaVenta";
import ModalDetalleVenta from "../../components/Modal/ModalDetalleVenta";
import { ShoppingCart, Eye } from "lucide-react";
import "../../styles/variables.scss";
import { getVentas } from "../../api/ventas.js";
import useDebouncedValue from "../../hooks/useDebouncedValue.js";
import { formatearFechaHora, formatearMonto } from "../../utils/format.js";

const ESTADOS = { completada: "Completado", pendiente: "Pendiente", anulada: "Anulado" };

const transformar = (v) => ({
  id: v.id,
  numeroVenta: v.id,
  fechaHora: formatearFechaHora(v.fecha),
  cliente: `${v.cliente.nombre} ${v.cliente.apellido}`,
  total: formatearMonto(v.total),
  estado: ESTADOS[v.estado] ?? v.estado,
});

function VentasPage() {
  const [datos, setDatos] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [ventaDetalle, setVentaDetalle] = useState(null);
  const [version, setVersion] = useState(0);

  const busquedaDebounced = useDebouncedValue(busqueda, 500);

  useEffect(() => {
    setPagina(1);
  }, [busquedaDebounced]);

  useEffect(() => {
    setCargando(true);
    getVentas({ pagina, limite: 10, q: busquedaDebounced || undefined })
      .then(({ data }) => {
        setDatos(data.datos.map(transformar));
        setTotal(data.total);
      })
      .catch(console.error)
      .finally(() => setCargando(false));
  }, [pagina, busquedaDebounced, version]);

  const columnas = [
    { key: "numeroVenta", label: "N° Venta" },
    { key: "fechaHora", label: "Fecha y Hora" },
    { key: "cliente", label: "Cliente" },
    { key: "total", label: "Total" },
    {
      key: "estado",
      label: "Estado",
      render: (valor) => {
        const estilos = {
          Completado: "bg-green-100 text-green-700",
          Pendiente: "bg-yellow-100 text-yellow-700",
          Anulado: "bg-red-100 text-red-700",
        };
        return (
          <span
            className={`rounded-full px-2 py-1 text-[10px] font-medium ${estilos[valor] ?? "bg-slate-100 text-slate-600"}`}
          >
            {valor}
          </span>
        );
      },
    },
    {
      key: "acciones",
      label: "Acciones",
      render: (_, fila) => (
        <button
          className="flex items-center gap-1 rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50 cursor-pointer"
          onClick={() => setVentaDetalle(fila.id)}
        >
          <Eye size={12} />
          Ver Detalle
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
                <ShoppingCart size={18} className="text-[var(--color-primario)]" />
                <h1 className="text-lg font-semibold text-[var(--color-texto-primario)]">
                  Gestión de Ventas
                </h1>
              </div>
              <p className="mt-1 text-xs text-[var(--color-texto-secundario)]">
                Registra nuevas ventas y consulta el historial.
              </p>
            </div>

            <button
              className="
                rounded-md bg-[var(--color-boton-primario)]
                px-4 py-2 text-xs font-medium text-white
                transition-opacity hover:opacity-90
              "
              onClick={() => setModalAbierto(true)}
            >
              + Nueva Venta
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
      <ModalNuevaVenta
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onSuccess={() => setVersion((v) => v + 1)}
      />
      <ModalDetalleVenta
        isOpen={ventaDetalle !== null}
        onClose={() => setVentaDetalle(null)}
        ventaId={ventaDetalle}
      />
    </>
  );
}

export default VentasPage;
