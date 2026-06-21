import { useState } from "react";
import { Search } from "lucide-react";
import Modal from "./Modal";
import { getClientes } from "../../api/clientes";
import { getProductos } from "../../api/productos";
import { createAlquiler } from "../../api/alquileres";

const estadoInicial = {
  clienteBusqueda: "",
  clienteSeleccionado: null,
  productoBusqueda: "",
  productoSeleccionado: null,
  fechaDevolucion: "",
};

function calcularTotal(producto, fechaDevolucion) {
  if (!producto || !fechaDevolucion || !producto.precioAlquiler) return null;
  const hoy = new Date();
  const fechaFin = new Date(fechaDevolucion);
  const dias = Math.max(1, Math.ceil((fechaFin - hoy) / (1000 * 60 * 60 * 24)));
  return { dias, total: dias * parseFloat(producto.precioAlquiler) };
}

function ModalNuevoAlquiler({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState(estadoInicial);
  const [resultadosCliente, setResultadosCliente] = useState([]);
  const [resultadosProducto, setResultadosProducto] = useState([]);
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [buscandoProducto, setBuscandoProducto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const handleBuscarCliente = async () => {
    if (!form.clienteBusqueda.trim()) return;
    setBuscandoCliente(true);
    try {
      const res = await getClientes({ q: form.clienteBusqueda.trim(), limite: 5 });
      setResultadosCliente(res.data.datos ?? res.data);
    } catch {
      setResultadosCliente([]);
    } finally {
      setBuscandoCliente(false);
    }
  };

  const handleSeleccionarCliente = (cliente) => {
    setForm((prev) => ({ ...prev, clienteSeleccionado: cliente, clienteBusqueda: "" }));
    setResultadosCliente([]);
  };

  const handleBuscarProducto = async () => {
    if (!form.productoBusqueda.trim()) return;
    setBuscandoProducto(true);
    try {
      const res = await getProductos({ q: form.productoBusqueda.trim(), limite: 5 });
      const datos = res.data.datos ?? res.data;
      setResultadosProducto(datos.filter((p) => p.precioAlquiler != null));
    } catch {
      setResultadosProducto([]);
    } finally {
      setBuscandoProducto(false);
    }
  };

  const handleSeleccionarProducto = (producto) => {
    setForm((prev) => ({ ...prev, productoSeleccionado: producto, productoBusqueda: "" }));
    setResultadosProducto([]);
  };

  const estimado = calcularTotal(form.productoSeleccionado, form.fechaDevolucion);

  const isDirty = JSON.stringify(form) !== JSON.stringify(estadoInicial);
  const isValid =
    form.clienteSeleccionado !== null &&
    form.productoSeleccionado !== null &&
    form.productoSeleccionado?.stock > 0 &&
    form.productoSeleccionado?.precioAlquiler != null &&
    form.fechaDevolucion !== "";

  const handleConfirmar = async () => {
    setCargando(true);
    setError(null);
    try {
      const usuarioId = JSON.parse(localStorage.getItem("usuario") || "{}")?.id;
      await createAlquiler({
        clienteId: form.clienteSeleccionado.id,
        productoId: form.productoSeleccionado.id,
        usuarioId,
        fecha_devolucion_esperada: form.fechaDevolucion,
      });
      setForm(estadoInicial);
      setResultadosCliente([]);
      setResultadosProducto([]);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Ocurrió un error al registrar el alquiler.");
    } finally {
      setCargando(false);
    }
  };

  const handleClose = () => {
    setForm(estadoInicial);
    setResultadosCliente([]);
    setResultadosProducto([]);
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      titulo="Registrar Alquiler"
      labelConfirmar="Confirmar Alquiler"
      onConfirmar={handleConfirmar}
      cargando={cargando}
      isDirty={isDirty}
      puedeConfirmar={isValid}
    >
      <div className="flex flex-col gap-4">

        {/* Socio / Cliente */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--color-texto-primario)]">
            Socio / Cliente
          </label>
          {form.clienteSeleccionado ? (
            <div className="flex items-center justify-between rounded-lg border border-[var(--color-lista-borde)] bg-slate-50 px-3 py-2">
              <div>
                <p className="text-xs font-semibold text-[var(--color-texto-primario)]">
                  {form.clienteSeleccionado.nombre} {form.clienteSeleccionado.apellido}
                </p>
                <p className="text-[11px] text-[var(--color-texto-secundario)]">
                  DNI {form.clienteSeleccionado.dni}
                </p>
              </div>
              <button
                type="button"
                className="text-[11px] text-[var(--color-primario)] hover:underline"
                onClick={() => setForm((prev) => ({ ...prev, clienteSeleccionado: null }))}
              >
                Cambiar
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Buscar por Nombre o DNI..."
                value={form.clienteBusqueda}
                onChange={(e) => setForm((prev) => ({ ...prev, clienteBusqueda: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && handleBuscarCliente()}
                className="modal-input"
              />
              <button
                type="button"
                className="flex items-center gap-1 rounded-md border border-[var(--color-lista-borde)] bg-white px-3 py-1.5 text-xs font-medium hover:bg-slate-50 whitespace-nowrap disabled:opacity-50"
                onClick={handleBuscarCliente}
                disabled={buscandoCliente}
              >
                <Search size={12} />
                {buscandoCliente ? "Buscando..." : "Buscar"}
              </button>
            </div>
          )}
          {resultadosCliente.length > 0 && (
            <ul className="mt-1 rounded-lg border border-[var(--color-lista-borde)] bg-white shadow-sm overflow-hidden">
              {resultadosCliente.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-col px-3 py-2 text-xs cursor-pointer hover:bg-slate-50 border-b border-[var(--color-lista-borde)] last:border-0"
                  onClick={() => handleSeleccionarCliente(c)}
                >
                  <span className="font-semibold text-[var(--color-texto-primario)]">
                    {c.nombre} {c.apellido}
                  </span>
                  <span className="text-[var(--color-texto-secundario)]">DNI {c.dni}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Producto */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--color-texto-primario)]">
            Producto (VHS/DVD)
          </label>
          {form.productoSeleccionado ? (
            <div className="flex items-center justify-between rounded-lg border border-[var(--color-lista-borde)] bg-slate-50 px-3 py-2">
              <div>
                <p className="text-xs font-semibold text-[var(--color-texto-primario)]">
                  {form.productoSeleccionado.titulo}
                </p>
                <p
                  className={`text-[11px] ${
                    form.productoSeleccionado.stock > 0 ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {form.productoSeleccionado.tipo} ·{" "}
                  {form.productoSeleccionado.stock > 0
                    ? `Disponible — $${parseFloat(form.productoSeleccionado.precioAlquiler).toLocaleString("es-AR")} x día`
                    : "Sin stock"}
                </p>
              </div>
              <button
                type="button"
                className="text-[11px] text-[var(--color-primario)] hover:underline"
                onClick={() => setForm((prev) => ({ ...prev, productoSeleccionado: null }))}
              >
                Cambiar
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Buscar por título..."
                value={form.productoBusqueda}
                onChange={(e) => setForm((prev) => ({ ...prev, productoBusqueda: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && handleBuscarProducto()}
                className="modal-input"
              />
              <button
                type="button"
                className="flex items-center gap-1 rounded-md border border-[var(--color-lista-borde)] bg-white px-3 py-1.5 text-xs font-medium hover:bg-slate-50 whitespace-nowrap disabled:opacity-50"
                onClick={handleBuscarProducto}
                disabled={buscandoProducto}
              >
                <Search size={12} />
                {buscandoProducto ? "Buscando..." : "Buscar"}
              </button>
            </div>
          )}
          {resultadosProducto.length > 0 && (
            <ul className="mt-1 rounded-lg border border-[var(--color-lista-borde)] bg-white shadow-sm overflow-hidden">
              {resultadosProducto.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-col px-3 py-2 text-xs cursor-pointer hover:bg-slate-50 border-b border-[var(--color-lista-borde)] last:border-0"
                  onClick={() => handleSeleccionarProducto(p)}
                >
                  <span className="font-semibold text-[var(--color-texto-primario)]">
                    {p.titulo}
                  </span>
                  <span
                    className={p.stock > 0 ? "text-emerald-600" : "text-red-500"}
                  >
                    {p.tipo} ·{" "}
                    {p.stock > 0
                      ? `Disponible — $${parseFloat(p.precioAlquiler).toLocaleString("es-AR")}/día`
                      : "Sin stock"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Fecha y total */}
        <div className="flex gap-3">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-medium text-[var(--color-texto-primario)]">
              Fecha de Devolución
            </label>
            <input
              type="date"
              value={form.fechaDevolucion}
              onChange={(e) => setForm((prev) => ({ ...prev, fechaDevolucion: e.target.value }))}
              className="modal-input"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-medium text-[var(--color-texto-primario)]">
              Total Estimado
            </label>
            <input
              type="text"
              readOnly
              value={
                estimado
                  ? `$${estimado.total.toLocaleString("es-AR")} (${estimado.dias} día${estimado.dias !== 1 ? "s" : ""})`
                  : ""
              }
              placeholder="—"
              className="modal-input bg-slate-50 text-[var(--color-texto-secundario)]"
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

      </div>
    </Modal>
  );
}

export default ModalNuevoAlquiler;
