import { useState, useEffect, useRef } from "react";
import { UserX, UserCheck, AlertTriangle } from "lucide-react";
import Modal from "./Modal";
import { updateCliente } from "../../api/clientes";

const estadoDesdeCliente = (c) =>
  c
    ? {
        nombre: c._nombre,
        apellido: c._apellido,
        documento: c.dni,
        telefono: c.telefono,
        email: c._email,
      }
    : { nombre: "", apellido: "", documento: "", telefono: "", email: "" };

function ModalEditarCliente({ isOpen, onClose, onSuccess, cliente }) {
  const [form, setForm] = useState(() => estadoDesdeCliente(cliente));
  const estadoInicialRef = useRef(estadoDesdeCliente(cliente));
  const [confirmandoDeshabilitar, setConfirmandoDeshabilitar] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [cargandoCambioEstado, setCargandoCambioEstado] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const inicial = estadoDesdeCliente(cliente);
      estadoInicialRef.current = inicial;
      setForm(inicial);
      setError(null);
      setConfirmandoDeshabilitar(false);
    }
  }, [isOpen, cliente]);

  const set = (campo) => (e) =>
    setForm((prev) => ({ ...prev, [campo]: e.target.value }));

  const isDirty =
    JSON.stringify(form) !== JSON.stringify(estadoInicialRef.current);
  const isValid =
    form.nombre.trim() !== "" &&
    form.apellido.trim() !== "" &&
    form.documento.trim() !== "" &&
    form.telefono.trim() !== "";

  const esInactivo = cliente?._estado === "inactivo";

  const handleGuardar = async () => {
    setCargando(true);
    setError(null);
    try {
      await updateCliente(cliente.id, {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        dni: form.documento.trim(),
        telefono: form.telefono.trim(),
        email: form.email.trim() || null,
      });
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

  const handleCambiarEstado = async () => {
    setCargandoCambioEstado(true);
    try {
      await updateCliente(cliente.id, {
        estado: esInactivo ? "activo" : "inactivo",
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Ocurrió un error al cambiar el estado del cliente.",
      );
      setConfirmandoDeshabilitar(false);
    } finally {
      setCargandoCambioEstado(false);
    }
  };

  const handleClose = () => {
    setConfirmandoDeshabilitar(false);
    setError(null);
    onClose();
  };

  const botonEstado = esInactivo ? (
    <button
      type="button"
      className="modal-btn-habilitar"
      onClick={handleCambiarEstado}
      disabled={cargando || cargandoCambioEstado}
    >
      <UserCheck size={13} />
      {cargandoCambioEstado ? "Habilitando..." : "Volver a habilitar"}
    </button>
  ) : (
    <button
      type="button"
      className="modal-btn-eliminar"
      onClick={() => setConfirmandoDeshabilitar(true)}
      disabled={cargando || cargandoCambioEstado}
    >
      <UserX size={13} />
      Deshabilitar
    </button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      titulo="Editar Cliente"
      labelConfirmar="Guardar cambios"
      onConfirmar={handleGuardar}
      cargando={cargando}
      isDirty={isDirty}
      puedeConfirmar={isDirty && isValid}
      accionIzquierda={botonEstado}
    >
      <div className="flex flex-col gap-4">
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

        <div className="flex gap-3">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-medium text-[var(--color-texto-primario)]">
              Documento (DNI/Pasaporte)
            </label>
            <input
              type="text"
              value={form.documento}
              onChange={set("documento")}
              className="modal-input"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-medium text-[var(--color-texto-primario)]">
              Teléfono
            </label>
            <input
              type="text"
              value={form.telefono}
              onChange={set("telefono")}
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
            placeholder="Opcional"
          />
        </div>

        {error && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {confirmandoDeshabilitar && (
          <div className="modal-guardia-overlay">
            <div className="modal-guardia-card">
              <div className="modal-guardia-icono">
                <AlertTriangle size={20} />
              </div>
              <p className="modal-guardia-texto">
                ¿Estás seguro de que querés deshabilitar a{" "}
                <strong>
                  {cliente?._nombre} {cliente?._apellido}
                </strong>
                ? El cliente no podrá operar en el sistema.
              </p>
              <div className="modal-guardia-botones">
                <button
                  type="button"
                  className="modal-btn-cancelar"
                  onClick={() => setConfirmandoDeshabilitar(false)}
                  disabled={cargandoCambioEstado}
                >
                  No, seguir editando
                </button>
                <button
                  type="button"
                  className="modal-btn-descartar"
                  onClick={handleCambiarEstado}
                  disabled={cargandoCambioEstado}
                >
                  {cargandoCambioEstado ? "Deshabilitando..." : "Sí, deshabilitar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default ModalEditarCliente;
