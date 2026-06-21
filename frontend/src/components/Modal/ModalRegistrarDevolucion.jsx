import { useState, useEffect } from "react";
import { Search, AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react";
import Modal from "./Modal";
import { useToast } from "../../context/ToastContext";
import { getAlquileres, registrarDevolucion } from "../../api/alquileres";
import { getClientes } from "../../api/clientes";
import { getMetodosPago } from "../../api/metodosPago";
import { getTarifasAlquiler } from "../../api/productos";

const estadoInicial = {
  clienteBusqueda: "",
  clienteSeleccionado: null,
  alquilerSeleccionado: null,
  cobrarRecargo: true,
  estadoProducto: "",
  metodoPagoId: "",
};

function calcularDiasRetraso(fechaEsperada) {
  if (!fechaEsperada) return 0;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const esperada = new Date(fechaEsperada);
  return Math.max(0, Math.ceil((hoy - esperada) / (1000 * 60 * 60 * 24)));
}

function ModalRegistrarDevolucion({ isOpen, onClose, onSuccess, preseleccionada = null }) {
  const showToast = useToast();
  const [form, setForm] = useState(estadoInicial);
  const [resultadosCliente, setResultadosCliente] = useState([]);
  const [alquileresCliente, setAlquileresCliente] = useState([]);
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [sinResultadosCliente, setSinResultadosCliente] = useState(false);
  const [cargandoAlquileres, setCargandoAlquileres] = useState(false);
  const [metodosPago, setMetodosPago] = useState([]);
  const [tarifas, setTarifas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    if (preseleccionada) {
      setForm((prev) => ({
        ...prev,
        clienteSeleccionado: preseleccionada.cliente,
        alquilerSeleccionado: preseleccionada.alquiler,
      }));
    } else {
      setForm(estadoInicial);
    }
    setResultadosCliente([]);
    setAlquileresCliente([]);
    setSinResultadosCliente(false);
    Promise.all([getMetodosPago(), getTarifasAlquiler()])
      .then(([metRes, tarRes]) => {
        setMetodosPago(metRes.data.filter((m) => m.activo));
        setTarifas(tarRes.data);
      })
      .catch(() => {});
  }, [isOpen, preseleccionada]);

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

  const handleSeleccionarCliente = async (cliente) => {
    setResultadosCliente([]);
    setForm((prev) => ({
      ...prev,
      clienteBusqueda: "",
      clienteSeleccionado: cliente,
      alquilerSeleccionado: null,
    }));
    setCargandoAlquileres(true);
    try {
      const res = await getAlquileres({ clienteId: cliente.id, estado: "activo", limite: 50 });
      setAlquileresCliente(res.data.datos ?? []);
    } catch {
      setAlquileresCliente([]);
    } finally {
      setCargandoAlquileres(false);
    }
  };

  const handleSeleccionarAlquiler = (alquiler) => {
    setForm((prev) => ({
      ...prev,
      alquilerSeleccionado: alquiler,
      cobrarRecargo: true,
      estadoProducto: "",
      metodoPagoId: "",
    }));
  };

  const alquiler = form.alquilerSeleccionado;
  const diasRetraso = alquiler
    ? calcularDiasRetraso(alquiler.fecha_devolucion_esperada)
    : 0;
  const esVencido = diasRetraso > 0;
  const tarifaDelProducto = alquiler
    ? tarifas.find((t) => t.tipo === alquiler.producto?.tipo)
    : null;
  const multaDia = tarifaDelProducto ? parseFloat(tarifaDelProducto.precio_por_dia) : 0;
  const recargo = diasRetraso * multaDia;

  const isDirty = JSON.stringify(form) !== JSON.stringify(estadoInicial);
  const isValid =
    alquiler !== null &&
    form.estadoProducto !== "" &&
    form.metodoPagoId !== "";

  const handleConfirmar = async () => {
    setCargando(true);
    setError(null);
    try {
      await registrarDevolucion(alquiler.id, {
        metodoPagoId: parseInt(form.metodoPagoId, 10),
        recargo_cobrado: esVencido ? form.cobrarRecargo : false,
        estado_producto_devuelto: form.estadoProducto,
      });
      setForm(estadoInicial);
      setResultadosCliente([]);
      setAlquileresCliente([]);
      showToast('success', 'Devolución registrada');
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.error || "Ocurrió un error al registrar la devolución.",
      );
    } finally {
      setCargando(false);
    }
  };

  const handleClose = () => {
    setForm(estadoInicial);
    setResultadosCliente([]);
    setAlquileresCliente([]);
    setError(null);
    onClose();
  };

  const handleCambiarAlquiler = () => {
    if (preseleccionada) {
      onClose();
    } else {
      setForm((prev) => ({
        ...prev,
        alquilerSeleccionado: null,
        estadoProducto: "",
        metodoPagoId: "",
      }));
    }
  };

  const handleCambiarCliente = () => {
    if (preseleccionada) {
      onClose();
    } else {
      setForm((prev) => ({
        ...prev,
        clienteSeleccionado: null,
        alquilerSeleccionado: null,
        estadoProducto: "",
        metodoPagoId: "",
      }));
      setAlquileresCliente([]);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      titulo="Registrar Devolución"
      labelConfirmar="Procesar Devolución"
      onConfirmar={handleConfirmar}
      cargando={cargando}
      isDirty={isDirty}
      puedeConfirmar={isValid}
    >
      <div className="flex flex-col gap-4">

        {/* Paso 1: buscar cliente */}
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
              {!preseleccionada && (
                <button
                  type="button"
                  className="text-[11px] text-[var(--color-primario)] hover:underline"
                  onClick={handleCambiarCliente}
                >
                  Cambiar
                </button>
              )}
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
                  <span className="text-[var(--color-texto-secundario)]">DNI {c.dni}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Paso 2: elegir alquiler activo */}
        {form.clienteSeleccionado && !form.alquilerSeleccionado && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--color-texto-primario)]">
              Alquiler a devolver
            </label>
            {cargandoAlquileres ? (
              <p className="text-xs text-[var(--color-texto-secundario)]">Cargando alquileres...</p>
            ) : alquileresCliente.length === 0 ? (
              <p className="text-xs text-[var(--color-texto-secundario)] bg-slate-50 border border-[var(--color-lista-borde)] rounded-lg px-3 py-2">
                Este cliente no tiene alquileres activos.
              </p>
            ) : (
              <ul className="rounded-lg border border-[var(--color-lista-borde)] bg-white overflow-hidden">
                {alquileresCliente.map((a) => {
                  const dias = calcularDiasRetraso(a.fecha_devolucion_esperada);
                  const vencido = dias > 0;
                  return (
                    <li
                      key={a.id}
                      className="flex items-center justify-between px-3 py-2.5 text-xs cursor-pointer hover:bg-slate-50 border-b border-[var(--color-lista-borde)] last:border-0"
                      onClick={() => handleSeleccionarAlquiler(a)}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-[var(--color-texto-primario)]">
                          {a.producto?.titulo}{" "}
                          <span className="font-normal text-[var(--color-texto-secundario)]">
                            ({a.producto?.tipo})
                          </span>
                        </span>
                        <span className={vencido ? "text-red-500" : "text-[var(--color-texto-secundario)]"}>
                          {vencido
                            ? `Vencido hace ${dias} día${dias !== 1 ? "s" : ""}`
                            : `Vence: ${a.fecha_devolucion_esperada.split("-").reverse().join("-")}`}
                        </span>
                      </div>
                      <ChevronRight size={13} className="text-slate-400 shrink-0" />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {/* Paso 3: detalle + formulario de devolución */}
        {alquiler && (
          <>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[var(--color-texto-primario)]">
                  Alquiler seleccionado
                </label>
                {!preseleccionada && (
                  <button
                    type="button"
                    className="text-[11px] text-[var(--color-primario)] hover:underline"
                    onClick={handleCambiarAlquiler}
                  >
                    Cambiar
                  </button>
                )}
              </div>
              <div
                className={`rounded-lg border p-3 ${
                  esVencido ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {esVencido ? (
                    <AlertTriangle size={14} className="text-red-500" />
                  ) : (
                    <CheckCircle2 size={14} className="text-emerald-600" />
                  )}
                  <span
                    className={`text-xs font-semibold ${
                      esVencido ? "text-red-600" : "text-emerald-700"
                    }`}
                  >
                    {esVencido ? "Alquiler Vencido" : "Alquiler Activo"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                  <div>
                    <span className="text-[var(--color-texto-secundario)]">Producto: </span>
                    <span className="font-medium text-[var(--color-texto-primario)]">
                      {alquiler.producto?.titulo} ({alquiler.producto?.tipo})
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--color-texto-secundario)]">Devolución prevista: </span>
                    <span
                      className={`font-medium ${
                        esVencido ? "text-red-600" : "text-[var(--color-texto-primario)]"
                      }`}
                    >
                      {alquiler.fecha_devolucion_esperada.split("-").reverse().join("-")}
                    </span>
                  </div>
                  {esVencido && (
                    <div>
                      <span className="text-[var(--color-texto-secundario)]">Días de retraso: </span>
                      <span className="font-medium text-red-600">{diasRetraso} días</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {esVencido && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--color-texto-secundario)]">
                    Cálculo de Recargo
                    {tarifaDelProducto && (
                      <span className="ml-1">
                        (${multaDia.toLocaleString("es-AR")}/día × {diasRetraso} días)
                      </span>
                    )}
                  </span>
                  <span className="text-sm font-bold text-[var(--color-texto-primario)]">
                    ${recargo.toLocaleString("es-AR")}
                  </span>
                </div>
                <label className="flex items-center gap-2 text-xs text-[var(--color-texto-primario)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.cobrarRecargo}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, cobrarRecargo: e.target.checked }))
                    }
                    className="h-3.5 w-3.5 accent-[var(--color-primario)]"
                  />
                  El cliente abona el recargo ahora
                </label>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-[var(--color-texto-primario)]">
                Estado del producto al devolverlo
              </label>
              <div className="flex gap-3">
                {[
                  { value: "bueno", label: "Buen estado" },
                  { value: "malo", label: "Mal estado / dañado" },
                ].map(({ value, label }) => (
                  <label
                    key={value}
                    className={`flex items-center gap-2 flex-1 rounded-lg border px-3 py-2 cursor-pointer text-xs transition-colors ${
                      form.estadoProducto === value
                        ? "border-[var(--color-primario)] bg-[#eef1ff]"
                        : "border-[var(--color-lista-borde)] hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="estadoProducto"
                      value={value}
                      checked={form.estadoProducto === value}
                      onChange={() =>
                        setForm((prev) => ({ ...prev, estadoProducto: value }))
                      }
                      className="accent-[var(--color-primario)]"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[var(--color-texto-primario)]">
                Método de Pago
              </label>
              <select
                value={form.metodoPagoId}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, metodoPagoId: e.target.value }))
                }
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
          </>
        )}

        {error && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

      </div>
    </Modal>
  );
}

export default ModalRegistrarDevolucion;
