import { useState, useEffect, useRef } from "react";
import { Plus, Trash2 } from "lucide-react";
import Modal from "./Modal";
import { getMetodosPago, createMetodoPago, updateMetodoPago } from "../../api/metodosPago";

function ModalMetodosPago({ isOpen, onClose }) {
  const [metodos, setMetodos] = useState([]);
  const originalesRef = useRef([]);
  const [nuevo, setNuevo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setNuevo("");
    getMetodosPago()
      .then((res) => {
        const datos = res.data.map((m) => ({ id: m.id, nombre: m.nombre, activo: m.activo }));
        setMetodos(datos);
        originalesRef.current = datos;
      })
      .catch(() => setError("No se pudieron cargar los métodos de pago."));
  }, [isOpen]);

  const setNombreMetodo = (id, nombre) =>
    setMetodos((prev) => prev.map((m) => (m.id === id ? { ...m, nombre } : m)));

  const toggleActivo = (id) =>
    setMetodos((prev) => prev.map((m) => (m.id === id ? { ...m, activo: !m.activo } : m)));

  const isDirty =
    nuevo.trim() !== "" ||
    metodos.some((m) => {
      const orig = originalesRef.current.find((o) => o.id === m.id);
      return orig && (m.nombre !== orig.nombre || m.activo !== orig.activo);
    });

  const isValid =
    metodos.every((m) => m.nombre.trim() !== "") &&
    (nuevo.trim() === "" || nuevo.trim().length > 0);

  const handleGuardar = async () => {
    setCargando(true);
    setError(null);
    try {
      const promesas = [];

      metodos.forEach((m) => {
        const orig = originalesRef.current.find((o) => o.id === m.id);
        if (orig && (m.nombre !== orig.nombre || m.activo !== orig.activo)) {
          promesas.push(updateMetodoPago(m.id, { nombre: m.nombre.trim(), activo: m.activo }));
        }
      });

      if (nuevo.trim()) {
        promesas.push(createMetodoPago(nuevo.trim()));
      }

      await Promise.all(promesas);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.error || "Ocurrió un error al guardar los cambios.",
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      titulo="Métodos de Pago"
      labelConfirmar="Guardar cambios"
      onConfirmar={handleGuardar}
      cargando={cargando}
      isDirty={isDirty}
      puedeConfirmar={isDirty && isValid}
    >
      <div className="flex flex-col gap-4">
        <p className="text-xs text-[var(--color-texto-secundario)]">
          Los métodos inactivos no aparecen como opción al registrar ventas ni devoluciones.
        </p>

        <div className="flex flex-col gap-2">
          {metodos.map((m) => (
            <div
              key={m.id}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                m.activo
                  ? "border-[var(--color-lista-borde)]"
                  : "border-slate-200 bg-slate-50 opacity-60"
              }`}
            >
              <input
                type="text"
                value={m.nombre}
                onChange={(e) => setNombreMetodo(m.id, e.target.value)}
                className="modal-input flex-1 py-1"
              />
              <label className="flex items-center gap-1.5 text-[11px] text-[var(--color-texto-secundario)] cursor-pointer whitespace-nowrap shrink-0">
                <input
                  type="checkbox"
                  checked={m.activo}
                  onChange={() => toggleActivo(m.id)}
                  className="h-3.5 w-3.5 accent-[var(--color-primario)]"
                />
                Activo
              </label>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--color-texto-primario)]">
            Agregar nuevo método
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ej: Transferencia bancaria"
              value={nuevo}
              onChange={(e) => setNuevo(e.target.value)}
              className="modal-input flex-1"
            />
            <div className="flex items-center justify-center w-8 h-8 shrink-0 rounded-md border border-dashed border-slate-300 text-slate-400">
              <Plus size={14} />
            </div>
          </div>
          <p className="text-[10px] text-[var(--color-texto-secundario)]">
            Se agrega al guardar los cambios.
          </p>
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

export default ModalMetodosPago;
