import { useState, useEffect } from "react";
import { Search, AlertTriangle, CheckCircle2 } from "lucide-react";
import Modal from "./Modal";
import { getAlquilerById, registrarDevolucion } from "../../api/alquileres";
import { getMetodosPago } from "../../api/metodosPago";
import { getTarifasAlquiler } from "../../api/productos";

const estadoInicial = {
  idAlquiler: "",
  alquilerEncontrado: null,
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

function ModalRegistrarDevolucion({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState(estadoInicial);
  const [metodosPago, setMetodosPago] = useState([]);
  const [tarifas, setTarifas] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    Promise.all([getMetodosPago(), getTarifasAlquiler()])
      .then(([metRes, tarRes]) => {
        setMetodosPago(metRes.data);
        setTarifas(tarRes.data);
      })
      .catch(() => {});
  }, [isOpen]);

  const handleBuscar = async () => {
    if (!form.idAlquiler.trim()) return;
    setBuscando(true);
    setError(null);
    try {
      const res = await getAlquilerById(form.idAlquiler.trim());
      const alquiler = res.data;
      if (alquiler.estado === "devuelto") {
        setForm((prev) => ({ ...prev, alquilerEncontrado: false }));
      } else {
        setForm((prev) => ({ ...prev, alquilerEncontrado: alquiler }));
      }
    } catch {
      setForm((prev) => ({ ...prev, alquilerEncontrado: false }));
    } finally {
      setBuscando(false);
    }
  };

  const alquiler = form.alquilerEncontrado;
  const diasRetraso = alquiler ? calcularDiasRetraso(alquiler.fecha_devolucion_esperada) : 0;
  const esVencido = diasRetraso > 0;
  const tarifaDelProducto = alquiler
    ? tarifas.find((t) => t.tipo === alquiler.producto?.tipo)
    : null;
  const multaDia = tarifaDelProducto ? parseFloat(tarifaDelProducto.precio_por_dia) : 0;
  const recargo = diasRetraso * multaDia;

  const isDirty = JSON.stringify(form) !== JSON.stringify(estadoInicial);
  const isValid =
    alquiler !== null &&
    alquiler !== false &&
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
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Ocurrió un error al registrar la devolución.");
    } finally {
      setCargando(false);
    }
  };

  const handleClose = () => {
    setForm(estadoInicial);
    setError(null);
    onClose();
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

        {/* Búsqueda */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--color-texto-primario)]">
            Número de Alquiler
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              placeholder="Ej. 42"
              value={form.idAlquiler}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, idAlquiler: e.target.value, alquilerEncontrado: null }))
              }
              onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
              className="modal-input"
            />
            <button
              type="button"
              className="flex items-center gap-1 rounded-md border border-[var(--color-lista-borde)] bg-white px-3 py-1.5 text-xs font-medium hover:bg-slate-50 whitespace-nowrap disabled:opacity-50"
              onClick={handleBuscar}
              disabled={buscando}
            >
              <Search size={12} />
              {buscando ? "Buscando..." : "Buscar"}
            </button>
          </div>
          {form.alquilerEncontrado === false && (
            <p className="text-[11px] text-red-500 mt-0.5">
              No se encontró ningún alquiler activo con ese número.
            </p>
          )}
        </div>

        {/* Info del alquiler */}
        {alquiler && alquiler !== false && (
          <>
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
                  <span className="text-[var(--color-texto-secundario)]">Cliente: </span>
                  <span className="font-medium text-[var(--color-texto-primario)]">
                    {alquiler.cliente?.nombre} {alquiler.cliente?.apellido}
                  </span>
                </div>
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
                    {alquiler.fecha_devolucion_esperada}
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

            {/* Recargo */}
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

            {/* Estado del producto */}
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
                      onChange={() => setForm((prev) => ({ ...prev, estadoProducto: value }))}
                      className="accent-[var(--color-primario)]"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* Método de pago */}
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
