import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";
import { getVentaById, anularVenta } from "../../api/ventas";
import { formatearFechaHora, formatearMonto } from "../../utils/format";
import { useToast } from "../../context/ToastContext";

const ESTADOS = {
  completada: { label: "Completada", clase: "bg-green-100 text-green-700" },
  pendiente:  { label: "Pendiente",  clase: "bg-yellow-100 text-yellow-700" },
  anulada:    { label: "Anulada",    clase: "bg-red-100 text-red-700" },
};

function ModalDetalleVenta({ isOpen, onClose, ventaId, onAnulada }) {
  const showToast = useToast();
  const [venta, setVenta] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [confirmandoAnular, setConfirmandoAnular] = useState(false);
  const [anulando, setAnulando] = useState(false);

  useEffect(() => {
    if (!isOpen || !ventaId) return;
    setCargando(true);
    setError(null);
    setVenta(null);
    setConfirmandoAnular(false);
    getVentaById(ventaId)
      .then((res) => setVenta(res.data))
      .catch(() => setError("No se pudo cargar el detalle de la venta."))
      .finally(() => setCargando(false));
  }, [isOpen, ventaId]);

  const handleAnular = async () => {
    setAnulando(true);
    try {
      await anularVenta(venta.id);
      showToast("success", "Venta anulada");
      onAnulada?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo anular la venta.");
      setConfirmandoAnular(false);
    } finally {
      setAnulando(false);
    }
  };

  const estado = venta ? (ESTADOS[venta.estado] ?? { label: venta.estado, clase: "bg-slate-100 text-slate-600" }) : null;

  const botonAnular = venta && venta.estado !== "anulada" && (
    <button
      type="button"
      className="modal-btn-eliminar"
      onClick={() => setConfirmandoAnular(true)}
      disabled={anulando}
    >
      Anular venta
    </button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      titulo={venta ? `Venta #${venta.id}` : "Detalle de Venta"}
      labelCancelar="Cerrar"
      isDirty={false}
      accionIzquierda={botonAnular}
    >
      <div className="flex flex-col gap-4">

        {cargando && (
          <p className="text-xs text-[var(--color-texto-secundario)]">Cargando...</p>
        )}

        {error && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {venta && (
          <div className="relative">
            {/* Encabezado */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-[var(--color-texto-secundario)]">
                  {formatearFechaHora(venta.fecha)}
                </span>
                <span className="text-[11px] text-[var(--color-texto-secundario)]">
                  Registrado por{" "}
                  <span className="font-medium text-[var(--color-texto-primario)]">
                    {venta.usuario?.nombre} {venta.usuario?.apellido}
                  </span>
                </span>
              </div>
              <span className={`rounded-full px-3 py-1 text-[10px] font-medium ${estado.clase}`}>
                {estado.label}
              </span>
            </div>

            <div className="h-px bg-[var(--color-lista-borde)]" />

            {/* Cliente y método de pago */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase tracking-wide text-[var(--color-texto-secundario)]">
                  Cliente
                </span>
                {venta.cliente ? (
                  <>
                    <span className="text-xs font-semibold text-[var(--color-texto-primario)]">
                      {venta.cliente.nombre} {venta.cliente.apellido}
                    </span>
                    <span className="text-[11px] text-[var(--color-texto-secundario)]">
                      DNI {venta.cliente.dni}
                    </span>
                  </>
                ) : (
                  <span className="text-xs font-semibold text-[var(--color-texto-primario)]">
                    Cliente no socio
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase tracking-wide text-[var(--color-texto-secundario)]">
                  Método de pago
                </span>
                <span className="text-xs font-semibold text-[var(--color-texto-primario)]">
                  {venta.metodoPago?.nombre ?? "—"}
                </span>
              </div>
            </div>

            <div className="h-px bg-[var(--color-lista-borde)]" />

            {/* Items */}
            <div className="rounded-lg border border-[var(--color-lista-borde)] overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-[var(--color-lista-encabezado)] uppercase tracking-wide">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Producto</th>
                    <th className="px-3 py-2 text-center font-medium w-12">Cant.</th>
                    <th className="px-3 py-2 text-right font-medium">P. Unit.</th>
                    <th className="px-3 py-2 text-right font-medium">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {venta.productos?.map((p) => (
                    <tr key={p.id} className="border-t border-[var(--color-lista-borde)]">
                      <td className="px-3 py-2 text-[var(--color-texto-primario)]">
                        <span>{p.titulo}</span>
                        <span className="ml-1.5 text-[10px] text-[var(--color-texto-secundario)]">
                          {p.tipo}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center text-[var(--color-texto-secundario)]">
                        {p.VentaProducto.cantidad}
                      </td>
                      <td className="px-3 py-2 text-right text-[var(--color-texto-secundario)]">
                        {formatearMonto(p.VentaProducto.precio_unitario)}
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-[var(--color-texto-primario)]">
                        {formatearMonto(p.VentaProducto.precio_unitario * p.VentaProducto.cantidad)}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-[var(--color-lista-borde)] bg-slate-50">
                    <td colSpan={3} className="px-3 py-2 text-right font-semibold text-[var(--color-texto-primario)]">
                      TOTAL
                    </td>
                    <td className="px-3 py-2 text-right font-bold text-[var(--color-texto-primario)]">
                      {formatearMonto(venta.total)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {confirmandoAnular && (
              <div className="modal-guardia-overlay">
                <div className="modal-guardia-card">
                  <div className="modal-guardia-icono">
                    <AlertTriangle size={20} />
                  </div>
                  <p className="modal-guardia-texto">
                    ¿Anular la venta <strong>#{venta.id}</strong>? Se repondrá el stock de los productos. Esta acción no se puede deshacer.
                  </p>
                  <div className="modal-guardia-botones">
                    <button
                      type="button"
                      className="modal-btn-cancelar"
                      onClick={() => setConfirmandoAnular(false)}
                      disabled={anulando}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="modal-btn-descartar"
                      onClick={handleAnular}
                      disabled={anulando}
                    >
                      {anulando ? "Anulando..." : "Sí, anular"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </Modal>
  );
}

export default ModalDetalleVenta;
