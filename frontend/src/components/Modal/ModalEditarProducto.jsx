import { useState, useEffect, useRef } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import Modal from "./Modal";
import { useToast } from "../../context/ToastContext";
import {
  updateProducto,
  deleteProducto,
  getTarifasAlquiler,
} from "../../api/productos";

const TIPOS_ALQUILABLES = ["VHS", "DVD"];

const estadoDesdeProducto = (p) =>
  p
    ? {
        titulo: p.titulo,
        stock: String(p.stock),
        precioVenta: p._precioVenta,
      }
    : { titulo: "", stock: "0", precioVenta: "" };

function ModalEditarProducto({ isOpen, onClose, onSuccess, producto }) {
  const showToast = useToast();
  const [form, setForm] = useState(() => estadoDesdeProducto(producto));
  const estadoInicialRef = useRef(estadoDesdeProducto(producto));
  const [tarifas, setTarifas] = useState([]);
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [cargandoEliminar, setCargandoEliminar] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const inicial = estadoDesdeProducto(producto);
      estadoInicialRef.current = inicial;
      setForm(inicial);
      setError(null);
      setConfirmandoEliminar(false);
      getTarifasAlquiler()
        .then((res) => setTarifas(res.data))
        .catch(() => setTarifas([]));
    }
  }, [isOpen, producto]);

  const set = (campo) => (e) =>
    setForm((prev) => ({ ...prev, [campo]: e.target.value }));

  const isDirty =
    JSON.stringify(form) !== JSON.stringify(estadoInicialRef.current);

  const esAlquilable = TIPOS_ALQUILABLES.includes(producto?.formato);
  const tarifaActual = tarifas.find((t) => t.tipo === producto?.formato);

  const isValid =
    form.titulo.trim() !== "" &&
    parseInt(form.stock, 10) >= 0 &&
    (esAlquilable || form.precioVenta.trim() !== "");

  const handleGuardar = async () => {
    setCargando(true);
    setError(null);
    try {
      await updateProducto(producto.id, {
        titulo: form.titulo.trim(),
        stock: parseInt(form.stock, 10),
        precio_venta: form.precioVenta ? parseFloat(form.precioVenta) : null,
      });
      showToast('success', 'Producto actualizado');
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.error || "Ocurrió un error al guardar los cambios.",
      );
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async () => {
    setCargandoEliminar(true);
    try {
      await deleteProducto(producto.id);
      showToast('success', 'Producto eliminado');
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Ocurrió un error al eliminar el producto.",
      );
      setConfirmandoEliminar(false);
    } finally {
      setCargandoEliminar(false);
    }
  };

  const handleClose = () => {
    setConfirmandoEliminar(false);
    setError(null);
    onClose();
  };

  const botonEliminar = (
    <button
      type="button"
      className="modal-btn-eliminar"
      onClick={() => setConfirmandoEliminar(true)}
      disabled={cargando || cargandoEliminar}
    >
      <Trash2 size={13} />
      Eliminar producto
    </button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      titulo="Editar Producto"
      labelConfirmar="Guardar cambios"
      onConfirmar={handleGuardar}
      cargando={cargando}
      isDirty={isDirty}
      puedeConfirmar={isDirty && isValid}
      accionIzquierda={botonEliminar}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--color-texto-primario)]">
            Título de la Obra
          </label>
          <input
            type="text"
            value={form.titulo}
            onChange={set("titulo")}
            className="modal-input"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-medium text-[var(--color-texto-primario)]">
              Formato
            </label>
            <input
              type="text"
              readOnly
              value={producto?.formato ?? ""}
              className="modal-input bg-slate-50 text-[var(--color-texto-secundario)]"
            />
            <span className="text-[10px] text-[var(--color-texto-secundario)]">
              El formato no puede modificarse.
            </span>
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-medium text-[var(--color-texto-primario)]">
              Stock
            </label>
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={set("stock")}
              className="modal-input"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-medium text-[var(--color-texto-primario)]">
              Precio de Venta ($)
            </label>
            <input
              type="number"
              min="0"
              placeholder={esAlquilable ? "Opcional" : "Requerido"}
              value={form.precioVenta}
              onChange={set("precioVenta")}
              className="modal-input"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-medium text-[var(--color-texto-primario)]">
              Precio de Alquiler ($/día)
            </label>
            <input
              type="text"
              readOnly
              value={
                tarifaActual
                  ? `$${parseFloat(tarifaActual.precio_por_dia).toLocaleString("es-AR")}`
                  : esAlquilable
                    ? "Cargando..."
                    : "No aplica"
              }
              className="modal-input bg-slate-50 text-[var(--color-texto-secundario)]"
            />
            <span className="text-[10px] text-[var(--color-texto-secundario)]">
              {esAlquilable
                ? "Tarifa global - no editable por producto"
                : "Este formato no se alquila"}
            </span>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {confirmandoEliminar && (
          <div className="modal-guardia-overlay">
            <div className="modal-guardia-card">
              <div className="modal-guardia-icono">
                <AlertTriangle size={20} />
              </div>
              <p className="modal-guardia-texto">
                ¿Estás seguro de que querés eliminar{" "}
                <strong>{producto?.titulo}</strong>? Esta acción no puede
                revertirse.
              </p>
              <div className="modal-guardia-botones">
                <button
                  type="button"
                  className="modal-btn-cancelar"
                  onClick={() => setConfirmandoEliminar(false)}
                  disabled={cargandoEliminar}
                >
                  No, seguir editando
                </button>
                <button
                  type="button"
                  className="modal-btn-descartar"
                  onClick={handleEliminar}
                  disabled={cargandoEliminar}
                >
                  {cargandoEliminar ? "Eliminando..." : "Sí, eliminar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default ModalEditarProducto;
