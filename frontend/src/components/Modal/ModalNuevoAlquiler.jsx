import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import Modal from "./Modal";
import { useToast } from "../../context/ToastContext";
import { getClientes } from "../../api/clientes";
import { getProductos } from "../../api/productos";
import { createAlquiler } from "../../api/alquileres";
import { getMetodosPago } from "../../api/metodosPago";
import { calcularAlquiler } from "../../utils/calculos.js";

const estadoInicial = {
  clienteBusqueda: "",
  clienteSeleccionado: null,
  productoBusqueda: "",
  productoSeleccionado: null,
  fechaDevolucion: "",
  metodoPagoId: "",
};

function ModalNuevoAlquiler({ isOpen, onClose, onSuccess }) {
  const showToast = useToast();
  const [form, setForm] = useState(estadoInicial);
  const [resultadosCliente, setResultadosCliente] = useState([]);
  const [resultadosProducto, setResultadosProducto] = useState([]);
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [buscandoProducto, setBuscandoProducto] = useState(false);
  const [sinResultadosCliente, setSinResultadosCliente] = useState(false);
  const [sinResultadosProducto, setSinResultadosProducto] = useState(false);
  const [metodosPago, setMetodosPago] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    getMetodosPago()
      .then((res) => setMetodosPago(res.data.filter((m) => m.activo)))
      .catch(() => setMetodosPago([]));
  }, [isOpen]);

  const handleBuscarCliente = async () => {
    if (!form.clienteBusqueda.trim()) return;
    setBuscandoCliente(true);
    setSinResultadosCliente(false);
    try {
      const res = await getClientes({ q: form.clienteBusqueda.trim(), limite: 5 });
      const datos = res.data.datos ?? res.data;
      setResultadosCliente(datos);
      setSinResultadosCliente(datos.length === 0);
    } catch {
      setResultadosCliente([]);
    } finally {
      setBuscandoCliente(false);
    }
  };

  const handleSeleccionarCliente = (cliente) => {
    setForm((prev) => ({
      ...prev,
      clienteSeleccionado: cliente,
      clienteBusqueda: "",
    }));
    setResultadosCliente([]);
  };

  const handleBuscarProducto = async () => {
    if (!form.productoBusqueda.trim()) return;
    setBuscandoProducto(true);
    setSinResultadosProducto(false);
    try {
      const res = await getProductos({ q: form.productoBusqueda.trim(), limite: 5 });
      const datos = (res.data.datos ?? res.data).filter((p) => p.precioAlquiler != null);
      setResultadosProducto(datos);
      setSinResultadosProducto(datos.length === 0);
    } catch {
      setResultadosProducto([]);
    } finally {
      setBuscandoProducto(false);
    }
  };

  const handleSeleccionarProducto = (producto) => {
    setForm((prev) => ({
      ...prev,
      productoSeleccionado: producto,
      productoBusqueda: "",
    }));
    setResultadosProducto([]);
  };

  const estimado = calcularAlquiler(
    form.fechaDevolucion,
    form.productoSeleccionado?.precioAlquiler,
  );

  const isDirty = JSON.stringify(form) !== JSON.stringify(estadoInicial);
  const isValid =
    form.clienteSeleccionado !== null &&
    form.productoSeleccionado !== null &&
    form.productoSeleccionado?.stock > 0 &&
    form.productoSeleccionado?.precioAlquiler != null &&
    form.fechaDevolucion !== "" &&
    form.metodoPagoId !== "";

  const handleConfirmar = async () => {
    setCargando(true);
    setError(null);
    try {
      const usuarioId = JSON.parse(localStorage.getItem("usuario") || "{}")?.id;
      await createAlquiler({
        clienteId: form.clienteSeleccionado.id,
        productoId: form.productoSeleccionado.id,
        usuarioId,
        metodoPagoId: parseInt(form.metodoPagoId, 10),
        fecha_devolucion_esperada: form.fechaDevolucion,
      });
      setForm(estadoInicial);
      setResultadosCliente([]);
      setResultadosProducto([]);
      showToast('success', 'Alquiler registrado');
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Ocurrió un error al registrar el alquiler.",
      );
    } finally {
      setCargando(false);
    }
  };

  const handleClose = () => {
    setForm(estadoInicial);
    setResultadosCliente([]);
    setResultadosProducto([]);
    setSinResultadosCliente(false);
    setSinResultadosProducto(false);
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
                  {form.clienteSeleccionado.nombre}{" "}
                  {form.clienteSeleccionado.apellido}
                </p>
                <p className="text-[11px] text-[var(--color-texto-secundario)]">
                  DNI {form.clienteSeleccionado.dni}
                </p>
              </div>
              <button
                type="button"
                className="text-[11px] text-[var(--color-primario)] hover:underline"
                onClick={() =>
                  setForm((prev) => ({ ...prev, clienteSeleccionado: null }))
                }
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
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, clienteBusqueda: e.target.value }));
                  setSinResultadosCliente(false);
                }}
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
          {sinResultadosCliente && (
            <p className="text-[11px] text-[var(--color-texto-secundario)] mt-0.5">
              No se encontraron clientes con ese criterio.
            </p>
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
                  <span className="text-[var(--color-texto-secundario)]">
                    DNI {c.dni}
                  </span>
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
                    form.productoSeleccionado.stock > 0
                      ? "text-emerald-600"
                      : "text-red-500"
                  }`}
                >
                  {form.productoSeleccionado.tipo} ·{" "}
                  {form.productoSeleccionado.stock > 0
                    ? `Disponible: $${parseFloat(form.productoSeleccionado.precioAlquiler).toLocaleString("es-AR")} x día`
                    : "Sin stock"}
                </p>
              </div>
              <button
                type="button"
                className="text-[11px] text-[var(--color-primario)] hover:underline"
                onClick={() =>
                  setForm((prev) => ({ ...prev, productoSeleccionado: null }))
                }
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
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, productoBusqueda: e.target.value }));
                  setSinResultadosProducto(false);
                }}
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
          {sinResultadosProducto && (
            <p className="text-[11px] text-[var(--color-texto-secundario)] mt-0.5">
              No se encontraron productos VHS/DVD con ese título.
            </p>
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
                    className={
                      p.stock > 0 ? "text-emerald-600" : "text-red-500"
                    }
                  >
                    {p.tipo} ·{" "}
                    {p.stock > 0
                      ? `Disponible - $${parseFloat(p.precioAlquiler).toLocaleString("es-AR")}/día`
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
              min={(() => { const h = new Date(); return `${h.getFullYear()}-${String(h.getMonth()+1).padStart(2,'0')}-${String(h.getDate()).padStart(2,'0')}`; })()}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  fechaDevolucion: e.target.value,
                }))
              }
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

        {/* Método de pago */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--color-texto-primario)]">
            Método de Pago
          </label>
          <select
            value={form.metodoPagoId}
            onChange={(e) => setForm((prev) => ({ ...prev, metodoPagoId: e.target.value }))}
            className="modal-input"
          >
            <option value="">Seleccionar método de pago...</option>
            {metodosPago.map((m) => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>
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
