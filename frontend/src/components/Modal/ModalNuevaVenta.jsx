import { useState, useEffect } from "react";
import { Search, Trash2 } from "lucide-react";
import Modal from "./Modal";
import { getClientes } from "../../api/clientes";
import { getProductos } from "../../api/productos";
import { getMetodosPago } from "../../api/metodosPago";
import { createVenta } from "../../api/ventas";

const estadoInicial = {
  clienteBusqueda: "",
  clienteSeleccionado: null,
  consumidorFinal: false,
  productoBusqueda: "",
  cantidad: "1",
  items: [],
  metodoPagoId: "",
};

function ModalNuevaVenta({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState(estadoInicial);
  const [resultadosCliente, setResultadosCliente] = useState([]);
  const [resultadosProducto, setResultadosProducto] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [buscandoProducto, setBuscandoProducto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    getMetodosPago()
      .then((res) => setMetodosPago(res.data))
      .catch(() => setMetodosPago([]));
  }, [isOpen]);

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
    setForm((prev) => ({ ...prev, clienteSeleccionado: cliente, consumidorFinal: false, clienteBusqueda: "" }));
    setResultadosCliente([]);
  };

  const handleConsumidorFinal = () => {
    setForm((prev) => ({ ...prev, consumidorFinal: true, clienteSeleccionado: null, clienteBusqueda: "" }));
    setResultadosCliente([]);
  };

  const handleBuscarProducto = async () => {
    if (!form.productoBusqueda.trim()) return;
    setBuscandoProducto(true);
    try {
      const res = await getProductos({ q: form.productoBusqueda.trim(), limite: 5 });
      const datos = res.data.datos ?? res.data;
      setResultadosProducto(datos.filter((p) => p.precio_venta != null && p.stock > 0));
    } catch {
      setResultadosProducto([]);
    } finally {
      setBuscandoProducto(false);
    }
  };

  const handleAgregarProducto = (producto) => {
    const cant = Math.max(1, parseInt(form.cantidad, 10) || 1);
    setForm((prev) => {
      const existente = prev.items.findIndex((i) => i.id === producto.id);
      if (existente >= 0) {
        const items = [...prev.items];
        items[existente] = { ...items[existente], cantidad: items[existente].cantidad + cant };
        return { ...prev, items, productoBusqueda: "", cantidad: "1" };
      }
      return {
        ...prev,
        items: [
          ...prev.items,
          {
            id: producto.id,
            titulo: producto.titulo,
            precio: parseFloat(producto.precio_venta),
            cantidad: cant,
          },
        ],
        productoBusqueda: "",
        cantidad: "1",
      };
    });
    setResultadosProducto([]);
  };

  const handleEliminarItem = (id) =>
    setForm((prev) => ({ ...prev, items: prev.items.filter((i) => i.id !== id) }));

  const total = form.items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  const isDirty = JSON.stringify(form) !== JSON.stringify(estadoInicial);
  const isValid =
    (form.clienteSeleccionado !== null || form.consumidorFinal) &&
    form.items.length > 0 &&
    form.metodoPagoId !== "";

  const handleConfirmar = async () => {
    setCargando(true);
    setError(null);
    try {
      const usuarioId = JSON.parse(localStorage.getItem("usuario") || "{}")?.id;
      await createVenta({
        clienteId: form.consumidorFinal ? null : form.clienteSeleccionado?.id,
        usuarioId,
        metodoPagoId: parseInt(form.metodoPagoId, 10),
        items: form.items.map((i) => ({ productoId: i.id, cantidad: i.cantidad })),
      });
      setForm(estadoInicial);
      setResultadosCliente([]);
      setResultadosProducto([]);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Ocurrió un error al registrar la venta.");
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
      titulo="Registrar Nueva Venta"
      labelConfirmar="Confirmar Venta"
      onConfirmar={handleConfirmar}
      cargando={cargando}
      isDirty={isDirty}
      puedeConfirmar={isValid}
    >
      <div className="flex flex-col gap-4">

        {/* Cliente */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--color-texto-primario)]">Cliente</label>
          {form.consumidorFinal ? (
            <div className="flex items-center justify-between rounded-lg border border-[var(--color-lista-borde)] bg-slate-50 px-3 py-2">
              <span className="text-xs font-semibold text-[var(--color-texto-primario)]">
                Consumidor Final
              </span>
              <button
                type="button"
                className="text-[11px] text-[var(--color-primario)] hover:underline"
                onClick={() => setForm((prev) => ({ ...prev, consumidorFinal: false }))}
              >
                Cambiar
              </button>
            </div>
          ) : form.clienteSeleccionado ? (
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
                placeholder="Buscar cliente o DNI..."
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
              <button
                type="button"
                className="rounded-md border border-[var(--color-lista-borde)] bg-white px-3 py-1.5 text-xs font-medium hover:bg-slate-50 whitespace-nowrap"
                onClick={handleConsumidorFinal}
              >
                Consumidor Final
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

        {/* Agregar producto */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--color-texto-primario)]">
            Agregar Producto
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar por título..."
              value={form.productoBusqueda}
              onChange={(e) => setForm((prev) => ({ ...prev, productoBusqueda: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handleBuscarProducto()}
              className="modal-input"
            />
            <input
              type="number"
              min="1"
              value={form.cantidad}
              onChange={(e) => setForm((prev) => ({ ...prev, cantidad: e.target.value }))}
              className="modal-input w-16 text-center"
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
          {resultadosProducto.length > 0 && (
            <ul className="mt-1 rounded-lg border border-[var(--color-lista-borde)] bg-white shadow-sm overflow-hidden">
              {resultadosProducto.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-col px-3 py-2 text-xs cursor-pointer hover:bg-slate-50 border-b border-[var(--color-lista-borde)] last:border-0"
                  onClick={() => handleAgregarProducto(p)}
                >
                  <span className="font-semibold text-[var(--color-texto-primario)]">
                    {p.titulo}
                  </span>
                  <span className="text-[var(--color-texto-secundario)]">
                    {p.tipo} · ${parseFloat(p.precio_venta).toLocaleString("es-AR")} · Stock:{" "}
                    {p.stock}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Tabla de items */}
        {form.items.length > 0 && (
          <div className="rounded-lg border border-[var(--color-lista-borde)] overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-[var(--color-lista-encabezado)] uppercase tracking-wide">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Producto</th>
                  <th className="px-3 py-2 text-center font-medium w-12">Cant.</th>
                  <th className="px-3 py-2 text-right font-medium">Precio</th>
                  <th className="px-3 py-2 text-right font-medium">Subtotal</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {form.items.map((item) => (
                  <tr key={item.id} className="border-t border-[var(--color-lista-borde)]">
                    <td className="px-3 py-2 text-[var(--color-texto-primario)]">{item.titulo}</td>
                    <td className="px-3 py-2 text-center text-[var(--color-texto-secundario)]">
                      {item.cantidad}
                    </td>
                    <td className="px-3 py-2 text-right text-[var(--color-texto-secundario)]">
                      ${item.precio.toLocaleString("es-AR")}
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-[var(--color-texto-primario)]">
                      ${(item.precio * item.cantidad).toLocaleString("es-AR")}
                    </td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        onClick={() => handleEliminarItem(item.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-[var(--color-lista-borde)] bg-slate-50">
                  <td
                    colSpan={3}
                    className="px-3 py-2 text-right font-semibold text-[var(--color-texto-primario)]"
                  >
                    TOTAL
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-[var(--color-texto-primario)]">
                    ${total.toLocaleString("es-AR")}
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        )}

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
            <option value="">Seleccionar método...</option>
            {metodosPago.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
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

export default ModalNuevaVenta;
