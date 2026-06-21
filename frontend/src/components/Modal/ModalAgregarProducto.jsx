import { useState, useEffect } from "react";
import Modal from "./Modal";
import { createProducto, getTarifasAlquiler } from "../../api/productos";

const TIPOS_ALQUILABLES = ["VHS", "DVD"];
const estadoInicial = { titulo: "", formato: "VHS", cantidad: "1", precioVenta: "" };

function ModalAgregarProducto({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState(estadoInicial);
  const [tarifas, setTarifas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    getTarifasAlquiler()
      .then((res) => setTarifas(res.data))
      .catch(() => setTarifas([]));
  }, [isOpen]);

  const set = (campo) => (e) => setForm((prev) => ({ ...prev, [campo]: e.target.value }));

  const tarifaActual = tarifas.find((t) => t.tipo === form.formato);

  const isDirty = JSON.stringify(form) !== JSON.stringify(estadoInicial);
  const isValid =
    form.titulo.trim() !== "" &&
    parseInt(form.cantidad, 10) > 0 &&
    (TIPOS_ALQUILABLES.includes(form.formato) || form.precioVenta.trim() !== "");

  const handleConfirmar = async () => {
    setCargando(true);
    setError(null);
    try {
      await createProducto({
        titulo: form.titulo.trim(),
        tipo: form.formato,
        precio_venta: form.precioVenta ? parseFloat(form.precioVenta) : null,
        stock: parseInt(form.cantidad, 10),
      });
      setForm(estadoInicial);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Ocurrió un error al agregar el producto.");
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
      titulo="Agregar Producto al Inventario"
      labelConfirmar="Guardar Producto"
      onConfirmar={handleConfirmar}
      cargando={cargando}
      isDirty={isDirty}
      puedeConfirmar={isValid}
    >
      <div className="flex flex-col gap-4">

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--color-texto-primario)]">
            Título de la Obra
          </label>
          <input
            type="text"
            placeholder="Ej. Pulp Fiction"
            value={form.titulo}
            onChange={set("titulo")}
            className="modal-input"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-medium text-[var(--color-texto-primario)]">Formato</label>
            <select value={form.formato} onChange={set("formato")} className="modal-input">
              <option value="VHS">VHS</option>
              <option value="DVD">DVD</option>
              <option value="CD">CD</option>
              <option value="VINILO">Vinilo</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-medium text-[var(--color-texto-primario)]">
              Cantidad Inicial (Stock)
            </label>
            <input
              type="number"
              min="1"
              value={form.cantidad}
              onChange={set("cantidad")}
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
              placeholder={TIPOS_ALQUILABLES.includes(form.formato) ? "Opcional" : "Requerido"}
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
                  : TIPOS_ALQUILABLES.includes(form.formato)
                  ? "Cargando..."
                  : "No aplica"
              }
              className="modal-input bg-slate-50 text-[var(--color-texto-secundario)]"
            />
            <span className="text-[10px] text-[var(--color-texto-secundario)]">
              {TIPOS_ALQUILABLES.includes(form.formato)
                ? "Tarifa global para este formato"
                : "Este formato no se alquila"}
            </span>
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

export default ModalAgregarProducto;
