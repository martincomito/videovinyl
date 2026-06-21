import { useState, useEffect } from "react";
import BarraSuperior from "../../components/BarraSuperior/BarraSuperior";
import MenuLateral from "../../components/MenuLateral/MenuLateral";
import Lista from "../../components/Lista/Lista";
import ModalAgregarProducto from "../../components/Modal/ModalAgregarProducto";
import { Package } from "lucide-react";
import "../../styles/variables.scss";
import { getProductos } from "../../api/productos.js";
import useDebouncedValue from "../../hooks/useDebouncedValue.js";

const ESTADOS = { disponible: "Disponible", alquilado: "Alquilado", agotado: "Agotado" };

const transformar = (p) => ({
  id: p.id,
  codigo: p.id,
  titulo: p.titulo,
  formato: p.tipo,
  stock: p.stock,
  precioAlquiler: p.precioAlquiler ? parseFloat(p.precioAlquiler) : null,
  precioVenta: parseFloat(p.precio_venta),
  estado: ESTADOS[p.estadoInventario] ?? p.estadoInventario,
});

function InventarioPage() {
  const [datos, setDatos] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);

  const busquedaDebounced = useDebouncedValue(busqueda, 500);

  useEffect(() => {
    setPagina(1);
  }, [busquedaDebounced]);

  useEffect(() => {
    setCargando(true);
    getProductos({ pagina, limite: 10, q: busquedaDebounced || undefined })
      .then(({ data }) => {
        setDatos(data.datos.map(transformar));
        setTotal(data.total);
      })
      .catch(console.error)
      .finally(() => setCargando(false));
  }, [pagina, busquedaDebounced]);

  const columnas = [
    { key: "codigo", label: "Cód." },
    { key: "titulo", label: "Título" },
    {
      key: "formato",
      label: "Formato",
      render: (valor) => (
        <span className="rounded bg-slate-100 px-2 py-1 text-xs">{valor}</span>
      ),
    },
    {
      key: "stock",
      label: "Stock",
      render: (valor) => (
        <span className={valor === 0 ? "font-semibold text-red-500" : ""}>
          {valor}
        </span>
      ),
    },
    {
      key: "precioAlquiler",
      label: "Precio Alquiler",
      render: (valor) => valor ? `$${valor.toLocaleString("es-AR")}` : "-",
    },
    {
      key: "precioVenta",
      label: "Precio Venta",
      render: (valor) => valor ? `$${valor.toLocaleString("es-AR")}` : "-",
    },
    {
      key: "estado",
      label: "Estado",
      render: (valor) => {
        const clases = {
          Disponible: "bg-green-100 text-green-700",
          Alquilado: "bg-blue-100 text-blue-700",
          Agotado: "bg-red-100 text-red-600",
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
      render: (_, fila) => (
        <div className="flex gap-2">
          <button
            className="rounded border px-2 py-1 text-xs hover:bg-slate-50 cursor-pointer"
            onClick={() => console.log("Editar:", fila.id)}
          >
            ✏
          </button>
          <button
            className="rounded border px-2 py-1 text-xs hover:bg-slate-50 cursor-pointer"
            onClick={() => console.log("Eliminar:", fila.id)}
          >
            🗑
          </button>
        </div>
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
                <Package size={18} className="text-[var(--color-primario)]" />
                <h1 className="text-lg font-semibold text-[var(--color-texto-primario)]">
                  Inventario y Stock
                </h1>
              </div>
              <p className="mt-1 text-xs text-[var(--color-texto-secundario)]">
                Consulta la disponibilidad, añade y modifica productos.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-1 rounded-md bg-[var(--color-boton-primario)]
                  px-4 py-2 text-xs font-medium text-white hover:opacity-90 cursor-pointer"
                onClick={() => setModalAbierto(true)}
              >
                + Agregar Producto
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
      <ModalAgregarProducto isOpen={modalAbierto} onClose={() => setModalAbierto(false)} />
    </>
  );
}

export default InventarioPage;
