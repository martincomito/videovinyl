/**
 * Pruebas de integración – flujo Alta de Cliente
 *
 * Se ejercita la interacción real entre:
 *   ClientesPage → ModalNuevoCliente → Modal → ToastProvider
 *
 * La única capa que se reemplaza es la API HTTP (axios). El resto de la
 * cadena — estado del formulario, validación, apertura/cierre del modal,
 * propagación de eventos y refresco de la lista — funciona de verdad.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
} from "@testing-library/react";
import { ToastProvider } from "../../context/ToastContext.jsx";
import ClientesPage from "./index.jsx";
import { getClientes, createCliente } from "../../api/clientes.js";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("../../api/clientes.js", () => ({
  getClientes: vi.fn(),
  createCliente: vi.fn(),
}));

vi.mock("../../components/BarraSuperior/BarraSuperior", () => ({
  default: () => <div />,
}));
vi.mock("../../components/MenuLateral/MenuLateral", () => ({
  default: () => <div />,
}));

// ── Helper de render ──────────────────────────────────────────────────────────

const clientesMock = [
  {
    id: 1,
    nombre: "Juan",
    apellido: "García",
    dni: "12345678",
    email: "juan@test.com",
    telefono: "1122334455",
    estado: "activo",
  },
];

async function renderIntegracion() {
  render(
    <ToastProvider>
      <ClientesPage />
    </ToastProvider>,
  );
  await waitFor(() => expect(getClientes).toHaveBeenCalled());
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Integración – listado de clientes", () => {
  beforeEach(() => {
    getClientes.mockResolvedValue({ data: { datos: clientesMock, total: 1 } });
    createCliente.mockResolvedValue({ data: {} });
  });

  it("carga y muestra los clientes al renderizar la página", async () => {
    await renderIntegracion();
    expect(screen.getByText("Juan García")).toBeInTheDocument();
    expect(screen.getByText("12345678")).toBeInTheDocument();
  });

  it("la lista se vacía correctamente cuando la API no devuelve datos", async () => {
    getClientes.mockResolvedValue({ data: { datos: [], total: 0 } });
    await renderIntegracion();
    expect(screen.getByText("No hay datos disponibles.")).toBeInTheDocument();
  });
});

describe("Integración – apertura del modal y validación del formulario", () => {
  beforeEach(() => {
    getClientes.mockResolvedValue({ data: { datos: clientesMock, total: 1 } });
    createCliente.mockResolvedValue({ data: {} });
  });

  it("el modal se abre al hacer click en Nuevo Cliente", async () => {
    await renderIntegracion();
    fireEvent.click(screen.getByText("+ Nuevo Cliente"));
    expect(screen.getByText("Alta de Cliente")).toBeInTheDocument();
  });

  it("el botón Registrar Cliente está deshabilitado con el formulario vacío", async () => {
    await renderIntegracion();
    fireEvent.click(screen.getByText("+ Nuevo Cliente"));

    const botonRegistrar = screen.getByRole("button", {
      name: "Registrar Cliente",
    });
    expect(botonRegistrar).toBeDisabled();
  });

  it("el botón se habilita cuando todos los campos están completos", async () => {
    await renderIntegracion();
    fireEvent.click(screen.getByText("+ Nuevo Cliente"));

    fireEvent.change(screen.getByPlaceholderText("Ej. Roberto"), {
      target: { value: "Carlos" },
    });
    fireEvent.change(screen.getByPlaceholderText("Ej. Gómez"), {
      target: { value: "Rodríguez" },
    });
    fireEvent.change(screen.getByPlaceholderText("Ej. 30123456"), {
      target: { value: "29000001" },
    });
    fireEvent.change(screen.getByPlaceholderText("Ej. 11-1234-5678"), {
      target: { value: "1133445566" },
    });
    fireEvent.change(screen.getByPlaceholderText("Ej. email@ejemplo.com"), {
      target: { value: "carlos@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Calle, Número, Ciudad"), {
      target: { value: "Av. Corrientes 1234" },
    });

    expect(
      screen.getByRole("button", { name: "Registrar Cliente" }),
    ).not.toBeDisabled();
  });
});

describe("Integración – flujo completo alta de cliente", () => {
  beforeEach(() => {
    getClientes.mockResolvedValue({ data: { datos: clientesMock, total: 1 } });
    createCliente.mockResolvedValue({ data: {} });
  });

  it("llama a createCliente con los datos del formulario al confirmar", async () => {
    await renderIntegracion();
    fireEvent.click(screen.getByText("+ Nuevo Cliente"));

    fireEvent.change(screen.getByPlaceholderText("Ej. Roberto"), {
      target: { value: "Carlos" },
    });
    fireEvent.change(screen.getByPlaceholderText("Ej. Gómez"), {
      target: { value: "Rodríguez" },
    });
    fireEvent.change(screen.getByPlaceholderText("Ej. 30123456"), {
      target: { value: "29000001" },
    });
    fireEvent.change(screen.getByPlaceholderText("Ej. 11-1234-5678"), {
      target: { value: "1133445566" },
    });
    fireEvent.change(screen.getByPlaceholderText("Ej. email@ejemplo.com"), {
      target: { value: "carlos@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Calle, Número, Ciudad"), {
      target: { value: "Av. Corrientes 1234" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Registrar Cliente" }));

    await waitFor(() => {
      expect(createCliente).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre: "Carlos",
          apellido: "Rodríguez",
          dni: "29000001",
          telefono: "1133445566",
          email: "carlos@test.com",
        }),
      );
    });
  });

  it("cierra el modal y refresca la lista tras el alta exitosa", async () => {
    await renderIntegracion();
    fireEvent.click(screen.getByText("+ Nuevo Cliente"));

    fireEvent.change(screen.getByPlaceholderText("Ej. Roberto"), {
      target: { value: "Carlos" },
    });
    fireEvent.change(screen.getByPlaceholderText("Ej. Gómez"), {
      target: { value: "Rodríguez" },
    });
    fireEvent.change(screen.getByPlaceholderText("Ej. 30123456"), {
      target: { value: "29000001" },
    });
    fireEvent.change(screen.getByPlaceholderText("Ej. 11-1234-5678"), {
      target: { value: "1133445566" },
    });
    fireEvent.change(screen.getByPlaceholderText("Ej. email@ejemplo.com"), {
      target: { value: "carlos@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Calle, Número, Ciudad"), {
      target: { value: "Av. Corrientes 1234" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Registrar Cliente" }));

    await waitFor(() => {
      // El modal se cerró: el título ya no está en el DOM
      expect(screen.queryByText("Alta de Cliente")).not.toBeInTheDocument();
    });

    // La lista se refrescó: getClientes se llamó más de una vez (montaje + post-alta)
    expect(getClientes.mock.calls.length).toBeGreaterThan(1);
  });

  it("muestra el error del servidor si createCliente falla", async () => {
    createCliente.mockRejectedValue({
      response: { data: { error: "El DNI ya está registrado" } },
    });

    await renderIntegracion();
    fireEvent.click(screen.getByText("+ Nuevo Cliente"));

    fireEvent.change(screen.getByPlaceholderText("Ej. Roberto"), {
      target: { value: "Carlos" },
    });
    fireEvent.change(screen.getByPlaceholderText("Ej. Gómez"), {
      target: { value: "Rodríguez" },
    });
    fireEvent.change(screen.getByPlaceholderText("Ej. 30123456"), {
      target: { value: "29000001" },
    });
    fireEvent.change(screen.getByPlaceholderText("Ej. 11-1234-5678"), {
      target: { value: "1133445566" },
    });
    fireEvent.change(screen.getByPlaceholderText("Ej. email@ejemplo.com"), {
      target: { value: "carlos@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Calle, Número, Ciudad"), {
      target: { value: "Av. Corrientes 1234" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Registrar Cliente" }));

    await waitFor(() => {
      expect(screen.getByText("El DNI ya está registrado")).toBeInTheDocument();
    });

    // El modal sigue abierto para que el usuario pueda corregir
    expect(screen.getByText("Alta de Cliente")).toBeInTheDocument();
  });
});
