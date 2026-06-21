import { useState, useEffect, useRef } from "react";
import { Disc3, Film } from "lucide-react";
import Modal from "./Modal";
import { getTarifasAlquiler, updateTarifaAlquiler } from "../../api/productos";

const FORMATOS = [
  { tipo: "DVD", label: "DVD", Icono: Disc3 },
  { tipo: "VHS", label: "VHS", Icono: Film },
];

const estadoDesde = (tarifas) => {
  const map = Object.fromEntries(tarifas.map((t) => [t.tipo, String(parseFloat(t.precio_por_dia))]));
  return {
    DVD: map.DVD ?? "",
    VHS: map.VHS ?? "",
  };
};

function ModalTarifasAlquiler({ isOpen, onClose }) {
  const [form, setForm] = useState({ DVD: "", VHS: "" });
  const estadoInicialRef = useRef({ DVD: "", VHS: "" });
  const [cargandoDatos, setCargandoDatos] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setCargandoDatos(true);
      getTarifasAlquiler()
        .then((res) => {
          const inicial = estadoDesde(res.data);
          estadoInicialRef.current = inicial;
          setForm(inicial);
        })
        .catch(() => setError("No se pudieron cargar las tarifas actuales."))
        .finally(() => setCargandoDatos(false));
    }
  }, [isOpen]);

  const set = (tipo) => (e) =>
    setForm((prev) => ({ ...prev, [tipo]: e.target.value }));

  const isDirty =
    JSON.stringify(form) !== JSON.stringify(estadoInicialRef.current);

  const isValid =
    parseFloat(form.DVD) > 0 &&
    parseFloat(form.VHS) > 0 &&
    !isNaN(parseFloat(form.DVD)) &&
    !isNaN(parseFloat(form.VHS));

  const handleGuardar = async () => {
    setCargando(true);
    setError(null);
    try {
      const promesas = [];
      if (form.DVD !== estadoInicialRef.current.DVD)
        promesas.push(updateTarifaAlquiler("DVD", parseFloat(form.DVD)));
      if (form.VHS !== estadoInicialRef.current.VHS)
        promesas.push(updateTarifaAlquiler("VHS", parseFloat(form.VHS)));
      await Promise.all(promesas);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.error || "Ocurrió un error al guardar las tarifas.",
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      titulo="Precios de Alquiler"
      labelConfirmar="Guardar cambios"
      onConfirmar={handleGuardar}
      cargando={cargando}
      isDirty={isDirty}
      puedeConfirmar={isDirty && isValid}
    >
      <div className="flex flex-col gap-4">
        <p className="text-xs text-[var(--color-texto-secundario)]">
          Estos precios aplican globalmente a todos los productos de cada
          formato. Se cobran por día de alquiler.
        </p>

        {cargandoDatos ? (
          <p className="text-xs text-[var(--color-texto-secundario)]">
            Cargando tarifas...
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {FORMATOS.map(({ tipo, label, Icono }) => (
              <div
                key={tipo}
                className="flex items-center gap-3 rounded-lg border border-[var(--color-lista-borde)] px-4 py-3"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100">
                  <Icono size={15} className="text-[var(--color-primario)]" />
                </div>
                <span className="w-12 text-sm font-semibold text-[var(--color-texto-primario)]">
                  {label}
                </span>
                <div className="flex flex-1 items-center gap-1.5">
                  <span className="text-xs text-[var(--color-texto-secundario)]">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form[tipo]}
                    onChange={set(tipo)}
                    className="modal-input flex-1"
                  />
                  <span className="text-xs text-[var(--color-texto-secundario)] whitespace-nowrap">
                    / día
                  </span>
                </div>
              </div>
            ))}
          </div>
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

export default ModalTarifasAlquiler;
