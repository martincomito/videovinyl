import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

const ToastContext = createContext(null);

let nextId = 1;

const ICONOS = {
  success: <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />,
  error:   <XCircle     size={16} className="text-red-500 shrink-0" />,
};


function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 10);
    const hide = setTimeout(() => setVisible(false), 3400);
    const remove = setTimeout(() => onRemove(toast.id), 3700);
    return () => { clearTimeout(show); clearTimeout(hide); clearTimeout(remove); };
  }, [toast.id, onRemove]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div
      className={`
        flex items-start gap-3 w-80 rounded-lg border bg-white px-4 py-3 shadow-lg
        transition-all duration-300
        ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}
      `}
    >
      {ICONOS[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-[var(--color-texto-primario)]">
          {toast.titulo}
        </p>
        {toast.mensaje && (
          <p className="mt-0.5 text-[11px] text-[var(--color-texto-secundario)]">
            {toast.mensaje}
          </p>
        )}
      </div>
      <button
        onClick={handleClose}
        className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <X size={13} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((type, titulo, mensaje) => {
    setToasts((prev) => [...prev, { id: nextId++, type, titulo, mensaje }]);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
