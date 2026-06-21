import { useState, useEffect } from "react";
import Modal from "./Modal";
import { getDeudaCliente, createPago } from "../../api/pagos";
import { getMetodosPago } from "../../api/metodosPago";
import { useToast } from "../../context/ToastContext";
import { formatearMonto } from "../../utils/format";

function ModalCobrar({ isOpen, onClose, onSuccess, cliente }) {
  const showToast = useToast();
  const [deuda, setDeuda] = useState(null);
  const [metodosPago, setMetodosPago] = useState([]);
  const [metodoPagoId, setMetodoPagoId] = useState("");
  const [monto, setMonto] = useState("");
  const [notas, setNotas] = useState("");
  const [cargandoDeuda, setCargandoDeuda] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !cliente) return;
    setCargandoDeuda(true);
    setError(null);
    Promise.all([
      getDeudaCliente(cliente.nSocio),
      getMetodosPago(),
    ])
      .then(([deudaRes, metodosRes]) => {
        setDeuda(deudaRes.data);
        setMonto(deudaRes.data.totalDeuda.toFixed(2));
        setMetodosPago(metodosRes.data);
        if (metodosRes.data.length > 0) setMetodoPagoId(String(metodosRes.data[0].id));
      })
      .catch(() => setError("No se pudo cargar la información de deuda."))
      .finally(() => setCargandoDeuda(false));
  }, [isOpen, cliente]);

  const handleClose = () => {
    setDeuda(null);
    setMonto("");
    setNotas("");
    setMetodoPagoId("");
    setError(null);
    onClose();
  };

  const montoNum = parseFloat(monto) || 0;
  const isValid =
    metodoPagoId !== "" &&
    montoNum > 0 &&
    deuda &&
    deuda.items.length > 0;

  const handleConfirmar = async () => {
    setCargando(true);
    setError(null);
    try {
      let restante = montoNum;
      for (const item of deuda.items) {
        if (restante <= 0) break;
        const pagoMonto = Math.min(restante, item.saldo);
        await createPago({
          metodoPagoId: parseInt(metodoPagoId),
          [item.tipo === "venta" ? "ventaId" : "alquilerId"]: item.id,
          monto: pagoMonto,
          notas: notas.trim() || undefined,
        });
        restante -= pagoMonto;
      }
      showToast("success", "Cobro registrado");
      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.error || "Ocurrió un error al registrar el cobro.");
    } finally {
      setCargando(false);
    }
  };

  const cubreDeudaTotal = deuda && montoNum >= deuda.totalDeuda - 0.001;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      titulo={`Cobrar deuda — ${cliente?.nombre ?? ""}`}
      labelConfirmar="Registrar cobro"
      onConfirmar={handleConfirmar}
      cargando={cargando}
      isDirty={monto !== "" || notas !== ""}
      puedeConfirmar={isValid}
    >
      <div className="flex flex-col gap-4">
        {cargandoDeuda ? (
          <p className="text-xs text-[var(--color-texto-secundario)] text-center py-4">
            Cargando deuda…
          </p>
        ) : deuda && deuda.items.length > 0 ? (
          <>
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[var(--color-texto-secundario)]">
                    <th className="text-left px-3 py-2 font-medium">Concepto</th>
                    <th className="text-right px-3 py-2 font-medium">Total</th>
                    <th className="text-right px-3 py-2 font-medium">Pagado</th>
                    <th className="text-right px-3 py-2 font-medium">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {deuda.items.map((item) => (
                    <tr key={`${item.tipo}-${item.id}`} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-[var(--color-texto-primario)]">
                        {item.descripcion}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-500">
                        {formatearMonto(item.total)}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-500">
                        {formatearMonto(item.pagado)}
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-red-600">
                        {formatearMonto(item.saldo)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50">
                    <td colSpan={3} className="px-3 py-2 text-xs font-semibold text-[var(--color-texto-primario)]">
                      Total deuda
                    </td>
                    <td className="px-3 py-2 text-right text-sm font-bold text-red-600">
                      {formatearMonto(deuda.totalDeuda)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex gap-3">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs font-medium text-[var(--color-texto-primario)]">
                  Método de pago
                </label>
                <select
                  value={metodoPagoId}
                  onChange={(e) => setMetodoPagoId(e.target.value)}
                  className="modal-input"
                >
                  {metodosPago.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs font-medium text-[var(--color-texto-primario)]">
                  Monto a cobrar
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  className="modal-input"
                />
              </div>
            </div>

            {montoNum > 0 && deuda && !cubreDeudaTotal && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Pago parcial: quedará un saldo de {formatearMonto(deuda.totalDeuda - montoNum)}.
              </p>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[var(--color-texto-primario)]">
                Notas <span className="text-slate-400">(opcional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="Ej. Pago en cuotas, cheque, etc."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                className="modal-input resize-none"
              />
            </div>
          </>
        ) : (
          <p className="text-xs text-[var(--color-texto-secundario)] text-center py-4">
            Este cliente no tiene deuda registrada.
          </p>
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

export default ModalCobrar;
