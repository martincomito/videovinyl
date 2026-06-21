import { useState } from "react";
import Modal from "./Modal";
import { createCliente } from "../../api/clientes";
import { useToast } from "../../context/ToastContext";

const estadoInicial = {
  nombre: "",
  apellido: "",
  documento: "",
  telefono: "",
  email: "",
  direccion: "",
};

function ModalNuevoCliente({ isOpen, onClose, onSuccess }) {
  const showToast = useToast();
  const [form, setForm] = useState(estadoInicial);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const set = (campo) => (e) =>
    setForm((prev) => ({ ...prev, [campo]: e.target.value }));

  const isDirty = JSON.stringify(form) !== JSON.stringify(estadoInicial);
  const isValid =
    form.nombre.trim() !== "" &&
    form.apellido.trim() !== "" &&
    form.documento.trim() !== "" &&
    form.telefono.trim() !== "" &&
    form.email.trim() !== "" &&
    form.direccion.trim() !== "";

  const handleConfirmar = async () => {
    setCargando(true);
    setError(null);
    try {
      await createCliente({
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        dni: form.documento.trim(),
        telefono: form.telefono.trim(),
        email: form.email.trim(),
        direccion: form.direccion.trim(),
      });
      setForm(estadoInicial);
      showToast('success', 'Cliente agregado');
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Ocurrió un error al registrar el cliente.",
      );
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
      titulo="Alta de Cliente"
      labelConfirmar="Registrar Cliente"
      onConfirmar={handleConfirmar}
      cargando={cargando}
      isDirty={isDirty}
      puedeConfirmar={isValid}
    >
      <div className="flex flex-col gap-4">
        <div className="flex gap-3">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-medium text-[var(--color-texto-primario)]">
              Nombre
            </label>
            <input
              type="text"
              placeholder="Ej. Roberto"
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
              placeholder="Ej. Gómez"
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
              placeholder="Ej. 30123456"
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
              placeholder="Ej. 11-1234-5678"
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
            placeholder="Ej. email@ejemplo.com"
            value={form.email}
            onChange={set("email")}
            className="modal-input"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--color-texto-primario)]">
            Dirección de Residencia
          </label>
          <input
            type="text"
            placeholder="Calle, Número, Ciudad"
            value={form.direccion}
            onChange={set("direccion")}
            className="modal-input"
          />
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

export default ModalNuevoCliente;
