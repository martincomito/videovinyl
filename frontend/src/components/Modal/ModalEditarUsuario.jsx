import { useState, useEffect, useRef } from "react";
import { ShieldCheck, User, Eye, EyeOff, Trash2, AlertTriangle } from "lucide-react";
import Modal from "./Modal";
import AvatarPicker from "../AvatarPicker/AvatarPicker";
import { updateUsuario, deleteUsuario } from "../../api/usuarios";
import { useToast } from "../../context/ToastContext";

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
    descripcion:
      "Acceso total al sistema, reportes financieros, y gestión de usuarios.",
    icono: ShieldCheck,
  },
];

const estadoDesdeUsuario = (u) =>
  u
    ? {
        nombre: u._nombre,
        apellido: u._apellido,
        email: u._email,
        rol: u._rol,
        estado: u._estado,
        avatar: u._avatar || "",
        nuevaPassword: "",
        repetirPassword: "",
      }
    : {
        nombre: "",
        apellido: "",
        email: "",
        rol: "empleado",
        estado: "activo",
        avatar: "",
        nuevaPassword: "",
        repetirPassword: "",
      };

function ModalEditarUsuario({ isOpen, onClose, onSuccess, usuario }) {
  const showToast = useToast();
  const [form, setForm] = useState(() => estadoDesdeUsuario(usuario));
  const estadoInicialRef = useRef(estadoDesdeUsuario(usuario));
  const [verPassword, setVerPassword] = useState(false);
  const [verRepetir, setVerRepetir] = useState(false);
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [cargandoEliminar, setCargandoEliminar] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const inicial = estadoDesdeUsuario(usuario);
      estadoInicialRef.current = inicial;
      setForm(inicial);
      setError(null);
      setVerPassword(false);
      setVerRepetir(false);
      setConfirmandoEliminar(false);
    }
  }, [isOpen, usuario]);

  const set = (campo) => (e) =>
    setForm((prev) => ({ ...prev, [campo]: e.target.value }));

  const isDirty =
    JSON.stringify(form) !== JSON.stringify(estadoInicialRef.current);

  const usuarioActualId = JSON.parse(localStorage.getItem("usuario") || "{}")?.id;
  const esPropiacuenta = usuario?.id === usuarioActualId;

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

  const passwordSinCambios =
    form.nuevaPassword === "" && form.repetirPassword === "";
  const passwordValida =
    passwordSinCambios ||
    (form.nuevaPassword.length >= 8 &&
      form.nuevaPassword === form.repetirPassword);

  const errorPassword = (() => {
    if (passwordSinCambios) return null;
    if (form.nuevaPassword !== "" && form.repetirPassword === "")
      return "Completá el campo Repetir contraseña.";
    if (form.nuevaPassword === "" && form.repetirPassword !== "")
      return "Completá el campo Nueva contraseña.";
    if (form.nuevaPassword !== form.repetirPassword)
      return "Las contraseñas no coinciden.";
    if (form.nuevaPassword.length < 8)
      return "La contraseña debe tener al menos 8 caracteres.";
    return null;
  })();

  const isValid =
    form.nombre.trim() !== "" &&
    form.apellido.trim() !== "" &&
    form.email.trim() !== "" &&
    emailValido &&
    passwordValida;

  const handleGuardar = async () => {
    setCargando(true);
    setError(null);
    try {
      const payload = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        email: form.email.trim(),
        rol: form.rol,
        estado: form.estado,
        avatar: form.avatar || null,
      };
      if (form.nuevaPassword) payload.password = form.nuevaPassword;
      const { data: usuarioActualizado } = await updateUsuario(usuario.id, payload);
      if (esPropiacuenta) {
        const actual = JSON.parse(localStorage.getItem("usuario") || "{}");
        localStorage.setItem("usuario", JSON.stringify({
          ...actual,
          nombre: payload.nombre,
          apellido: payload.apellido,
          email: payload.email,
          avatar: payload.avatar,
        }));
      }
      showToast('success', 'Usuario actualizado');
      onSuccess?.(usuarioActualizado);
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
      await deleteUsuario(usuario.id);
      showToast('success', 'Usuario eliminado');
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.error || "Ocurrió un error al eliminar el usuario.",
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
      disabled={cargando || cargandoEliminar || esPropiacuenta}
      title={esPropiacuenta ? "No podés eliminar tu propia cuenta" : undefined}
    >
      <Trash2 size={13} />
      Eliminar usuario
    </button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      titulo="Editar Usuario"
      labelConfirmar="Guardar cambios"
      onConfirmar={handleGuardar}
      cargando={cargando}
      isDirty={isDirty}
      puedeConfirmar={isDirty && isValid}
      accionIzquierda={botonEliminar}
    >
      <div className="flex flex-col gap-4">

        <div className="flex justify-center">
          <AvatarPicker
            value={form.avatar}
            onChange={(v) => setForm((prev) => ({ ...prev, avatar: v }))}
            nombre={form.nombre}
            apellido={form.apellido}
          />
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-medium text-[var(--color-texto-primario)]">
              Nombre
            </label>
            <input
              type="text"
              value={form.nombre}
              onChange={set("nombre")}
              className="modal-input"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-medium text-[var(--color-texto-primario)]">
              Apellido
            </label>
            <input
              type="text"
              value={form.apellido}
              onChange={set("apellido")}
              className="modal-input"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--color-texto-primario)]">
            Correo Electrónico
          </label>
          <input
            type="email"
            value={form.email}
            onChange={set("email")}
            className="modal-input"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-medium text-[var(--color-texto-primario)]">
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={verPassword ? "text" : "password"}
                placeholder="Dejar vacío para no cambiar"
                value={form.nuevaPassword}
                onChange={set("nuevaPassword")}
                className="modal-input pr-9"
              />
              <button
                type="button"
                onClick={() => setVerPassword((v) => !v)}
                tabIndex={-1}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {verPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-medium text-[var(--color-texto-primario)]">
              Repetir Contraseña
            </label>
            <div className="relative">
              <input
                type={verRepetir ? "text" : "password"}
                placeholder="Repetir nueva contraseña"
                value={form.repetirPassword}
                onChange={set("repetirPassword")}
                className="modal-input pr-9"
              />
              <button
                type="button"
                onClick={() => setVerRepetir((v) => !v)}
                tabIndex={-1}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {verRepetir ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
        </div>

        {errorPassword && (
          <p className="text-[11px] text-red-500 -mt-2">{errorPassword}</p>
        )}

        <div className="flex gap-3">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-medium text-[var(--color-texto-primario)]">
              Estado
            </label>
            <select
              value={form.estado}
              onChange={set("estado")}
              disabled={esPropiacuenta}
              className="modal-input disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
            {esPropiacuenta && (
              <span className="text-[10px] text-[var(--color-texto-secundario)]">
                No podés modificar el estado de tu propia cuenta.
              </span>
            )}
          </div>
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
                name="rol-editar"
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

        {confirmandoEliminar && (
          <div className="modal-guardia-overlay">
            <div className="modal-guardia-card">
              <div className="modal-guardia-icono">
                <AlertTriangle size={20} />
              </div>
              <p className="modal-guardia-texto">
                ¿Estás seguro? Esto va a eliminar a{" "}
                <strong>
                  {usuario?._nombre} {usuario?._apellido}
                </strong>{" "}
                del sistema. Esta acción no se puede deshacer.
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

export default ModalEditarUsuario;
