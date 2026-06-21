import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ClientesPage from './index.jsx';
import { getClientes } from '../../api/clientes.js';

// Mock API
vi.mock('../../api/clientes.js', () => ({
  getClientes: vi.fn(),
}));

// Mock componentes de layout que dependen de Router / localStorage
vi.mock('../../components/BarraSuperior/BarraSuperior', () => ({
  default: () => <div data-testid="barra-superior" />,
}));
vi.mock('../../components/MenuLateral/MenuLateral', () => ({
  default: () => <div data-testid="menu-lateral" />,
}));

// Mock modales para evitar dependencia del ToastContext
vi.mock('../../components/Modal/ModalNuevoCliente', () => ({
  default: ({ isOpen, onClose }) =>
    isOpen ? (
      <div data-testid="modal-nuevo-cliente">
        <button onClick={onClose}>Cerrar</button>
      </div>
    ) : null,
}));
vi.mock('../../components/Modal/ModalEditarCliente', () => ({
  default: ({ isOpen }) =>
    isOpen ? <div data-testid="modal-editar-cliente" /> : null,
}));

const clientesMock = [
  {
    id: 1, nombre: 'Juan', apellido: 'García', dni: '12345678',
    email: 'juan@test.com', telefono: '1122334455', estado: 'activo',
  },
  {
    id: 2, nombre: 'María', apellido: 'López', dni: '87654321',
    email: 'maria@test.com', telefono: '9988776655', estado: 'inactivo',
  },
];

// Renderiza el componente y espera a que se complete la carga inicial.
// Esto evita warnings de act() causados por actualizaciones de estado asíncronas.
async function renderPage() {
  render(<ClientesPage />);
  await waitFor(() => expect(getClientes).toHaveBeenCalled());
}

describe('ClientesPage', () => {
  beforeEach(() => {
    getClientes.mockResolvedValue({
      data: { datos: clientesMock, total: 2 },
    });
  });

  it('muestra el título de la sección', async () => {
    await renderPage();
    expect(screen.getByText('Directorio de Clientes')).toBeInTheDocument();
  });

  it('muestra el botón para agregar un nuevo cliente', async () => {
    await renderPage();
    expect(screen.getByText('+ Nuevo Cliente')).toBeInTheDocument();
  });

  it('llama a getClientes al montar el componente', async () => {
    await renderPage();
    expect(getClientes).toHaveBeenCalled();
  });

  it('muestra los nombres de los clientes cargados', async () => {
    await renderPage();
    expect(screen.getByText('Juan García')).toBeInTheDocument();
    expect(screen.getByText('María López')).toBeInTheDocument();
  });

  it('muestra los DNIs de los clientes', async () => {
    await renderPage();
    expect(screen.getByText('12345678')).toBeInTheDocument();
    expect(screen.getByText('87654321')).toBeInTheDocument();
  });

  it('abre el modal al hacer click en Nuevo Cliente', async () => {
    await renderPage();
    fireEvent.click(screen.getByText('+ Nuevo Cliente'));
    expect(screen.getByTestId('modal-nuevo-cliente')).toBeInTheDocument();
  });

  it('cierra el modal al llamar onClose', async () => {
    await renderPage();
    fireEvent.click(screen.getByText('+ Nuevo Cliente'));
    expect(screen.getByTestId('modal-nuevo-cliente')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cerrar'));
    expect(screen.queryByTestId('modal-nuevo-cliente')).not.toBeInTheDocument();
  });

  it('abre el modal de edición al hacer click en Editar', async () => {
    await renderPage();
    fireEvent.click(screen.getAllByText('Editar')[0]);
    expect(screen.getByTestId('modal-editar-cliente')).toBeInTheDocument();
  });

  it('muestra "No hay datos disponibles" cuando la lista está vacía', async () => {
    getClientes.mockResolvedValue({ data: { datos: [], total: 0 } });
    render(<ClientesPage />);
    await waitFor(() => {
      expect(screen.getByText('No hay datos disponibles.')).toBeInTheDocument();
    });
  });
});
