import { useState } from "react";
import { ShieldCheck, User } from "lucide-react";
import Modal from "./Modal";
import { createUsuario } from "../../api/usuarios";

const estadoInicial = { nombre: "", apellido: "", email: "", password: "", rol: "empleado" };

const ROLES = [
  {
    value: "empleado",
    label: "Empleado Estándar",
    descripcion:
      "Puede gestionar ventas, alquileres y clientes. No puede ver reportes financieros ni modificar stock base.",
    icono: User,
  },
  {
    value: "admin",
    label: "Administrador",
    descripcion: "Acceso total al sistema, reportes financieros, y gestión de usuarios.",
    icono: ShieldCheck,
  },
];

function ModalAnadirUsuario({ isOpen, onClose }) {
  const [form, setForm] = useState(estadoInicial);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const set = (campo) => (e) => setForm((prev) => ({ ...prev, [campo]: e.target.value }));

  const isDirty = JSON.stringify(form) !== JSON.stringify(estadoInicial);
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const isValid =
    form.nombre.trim() !== "" &&
    form.apellido.trim() !== "" &&
    form.email.trim() !== "" &&
    emailValido &&
    form.password.length >= 8;

  const handleConfirmar = async () => {
    setCargando(true);
    setError(null);
    try {
      await createUsuario({
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        email: form.email.trim(),
        password: form.password,
        rol: form.rol,
        estado: "activo",
      });
      setForm(estadoInicial);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Ocurrió un error al crear el usuario.");
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
      titulo="Crear Nuevo Usuario"
      labelConfirmar="Crear Usuario"
      onConfirmar={handleConfirmar}
      cargando={cargando}
      isDirty={isDirty}
      puedeConfirmar={isValid}
    >
      <div className="flex flex-col gap-4">

        <div className="flex gap-3">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-medium text-[var(--color-texto-primario)]">Nombre</label>
            <input
              type="text"
              placeholder="Ej. Juan"
              value={form.nombre}
              onChange={set("nombre")}
              className="modal-input"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-medium text-[var(--color-texto-primario)]">Apellido</label>
            <input
              type="text"
              placeholder="Ej. Empleado"
              value={form.apellido}
              onChange={set("apellido")}
              className="modal-input"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--color-texto-primario)]">
            Correo Electrónico (Para Iniciar Sesión)
          </label>
          <input
            type="email"
            placeholder="Ej. empleado@videovinyl.com"
            value={form.email}
            onChange={set("email")}
            className="modal-input"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--color-texto-primario)]">
            Contraseña Temporal
          </label>
          <input
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={form.password}
            onChange={set("password")}
            className="modal-input"
          />
          <span className="text-[10px] text-[var(--color-texto-secundario)]">
            El usuario deberá cambiarla en el próximo inicio de sesión.
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[var(--color-texto-primario)]">
            Rol de Acceso
          </label>
          {ROLES.map(({ value, label, descripcion, icono: Icono }) => (
            <label
              key={value}
              className={`
                flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors
                ${
                  form.rol === value
                    ? "border-[var(--color-primario)] bg-[#eef1ff]"
                    : "border-[var(--color-lista-borde)] hover:bg-slate-50"
                }
              `}
            >
              <input
                type="radio"
                name="rol"
                value={value}
                checked={form.rol === value}
                onChange={set("rol")}
                className="mt-0.5 accent-[var(--color-primario)]"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <Icono size={13} className="text-[var(--color-primario)]" />
                  <span className="text-xs font-semibold text-[var(--color-texto-primario)]">
                    {label}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-[var(--color-texto-secundario)] leading-relaxed">
                  {descripcion}
                </p>
              </div>
            </label>
          ))}
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

export default ModalAnadirUsuario;
