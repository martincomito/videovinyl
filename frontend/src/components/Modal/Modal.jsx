import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle } from "lucide-react";
import "./Modal.scss";

function Modal({
  isOpen,
  onClose,
  titulo,
  children,
  labelConfirmar,
  onConfirmar,
  cargando = false,
  isDirty = false,
  puedeConfirmar = true,
}) {
  const [confirmandoCierre, setConfirmandoCierre] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setConfirmandoCierre(false);
      return;
    }
    const handleKeyDown = (e) => {
      if (e.key !== "Escape") return;
      if (isDirty) {
        setConfirmandoCierre(true);
      } else {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, isDirty]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isDirty) {
      setConfirmandoCierre(true);
    } else {
      onClose();
    }
  };

  const handleForzarCierre = () => {
    setConfirmandoCierre(false);
    onClose();
  };

  return createPortal(
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-titulo">{titulo}</h2>
          <button
            className="modal-cerrar"
            onClick={handleClose}
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">{children}</div>

        <div className="modal-footer">
          <button
            type="button"
            className="modal-btn-cancelar"
            onClick={handleClose}
            disabled={cargando}
          >
            Cancelar
          </button>
          {labelConfirmar && onConfirmar && (
            <button
              type="button"
              className="modal-btn-confirmar"
              onClick={onConfirmar}
              disabled={cargando || !puedeConfirmar}
              title={
                !puedeConfirmar
                  ? "Completá todos los campos requeridos"
                  : undefined
              }
            >
              {cargando ? "Procesando..." : labelConfirmar}
            </button>
          )}
        </div>

        {confirmandoCierre && (
          <div className="modal-guardia-overlay">
            <div className="modal-guardia-card">
              <div className="modal-guardia-icono">
                <AlertTriangle size={20} />
              </div>
              <p className="modal-guardia-texto">
                ¿Querés cancelar la operación? Se van a perder los datos
                ingresados.
              </p>
              <div className="modal-guardia-botones">
                <button
                  type="button"
                  className="modal-btn-cancelar"
                  onClick={() => setConfirmandoCierre(false)}
                >
                  Seguir editando
                </button>
                <button
                  type="button"
                  className="modal-btn-descartar"
                  onClick={handleForzarCierre}
                >
                  Sí, cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

export default Modal;
