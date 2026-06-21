import { useState } from "react";
import { createPortal } from "react-dom";
import { Lock, Eye, EyeOff } from "lucide-react";
import { cambiarPassword } from "../../api/usuarios";

function ModalCambiarPassword({ onExito }) {
  const [form, setForm] = useState({ nueva: "", confirmar: "" });
  const [verNueva, setVerNueva] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const cambiar = (campo) => (e) =>
    setForm((prev) => ({ ...prev, [campo]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.nueva.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (form.nueva !== form.confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);
    try {
      await cambiarPassword(form.nueva);
      const raw = JSON.parse(localStorage.getItem("usuario") || "{}");
      localStorage.setItem(
        "usuario",
        JSON.stringify({ ...raw, debe_cambiar_password: false })
      );
      onExito();
    } catch (err) {
      setError(err.response?.data?.error || "Error al cambiar la contraseña.");
    } finally {
      setCargando(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-xl border border-[var(--color-card-borde)] bg-white p-6 shadow-xl">
        <div className="mb-5 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
            <Lock size={22} className="text-indigo-600" />
          </div>
          <h2 className="text-base font-semibold text-[var(--color-texto-primario)]">
            Cambiá tu contraseña
          </h2>
          <p className="text-xs text-[var(--color-texto-secundario)]">
            Es tu primer inicio de sesión. Elegí una contraseña nueva para continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--color-texto-secundario)]">
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                type={verNueva ? "text" : "password"}
                value={form.nueva}
                onChange={cambiar("nueva")}
                required
                minLength={6}
                className="modal-input pr-9"
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setVerNueva((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {verNueva ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--color-texto-secundario)]">
              Confirmar contraseña
            </label>
            <div className="relative">
              <input
                type={verConfirmar ? "text" : "password"}
                value={form.confirmar}
                onChange={cambiar("confirmar")}
                required
                className="modal-input pr-9"
                placeholder="Repetí la contraseña"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setVerConfirmar((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {verConfirmar ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="mt-1 w-full rounded-md bg-[var(--color-boton-primario)] py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {cargando ? "Guardando…" : "Guardar contraseña"}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default ModalCambiarPassword;
