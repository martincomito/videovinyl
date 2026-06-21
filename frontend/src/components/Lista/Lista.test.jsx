import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Lista from './Lista.jsx';

const columnas = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'email', label: 'Email' },
];

const datos = [
  { id: 1, nombre: 'Juan García', email: 'juan@test.com' },
  { id: 2, nombre: 'María López', email: 'maria@test.com' },
];

describe('Lista – encabezados y filas', () => {
  it('renderiza los encabezados de columna', () => {
    render(<Lista columnas={columnas} datos={[]} />);
    expect(screen.getByText('Nombre')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renderiza una fila por cada dato', () => {
    render(<Lista columnas={columnas} datos={datos} />);
    expect(screen.getByText('Juan García')).toBeInTheDocument();
    expect(screen.getByText('María López')).toBeInTheDocument();
  });

  it('usa la función render personalizada de la columna cuando se provee', () => {
    const columnasConRender = [
      { key: 'nombre', label: 'Nombre', render: (val) => <strong>{val.toUpperCase()}</strong> },
    ];
    render(<Lista columnas={columnasConRender} datos={[{ id: 1, nombre: 'Juan' }]} />);
    expect(screen.getByText('JUAN')).toBeInTheDocument();
  });

  it('muestra el título cuando se provee la prop titulo', () => {
    render(<Lista columnas={columnas} datos={[]} titulo="Listado de clientes" />);
    expect(screen.getByText('Listado de clientes')).toBeInTheDocument();
  });
});

describe('Lista – estado vacío', () => {
  it('muestra "No hay datos disponibles." cuando datos está vacío', () => {
    render(<Lista columnas={columnas} datos={[]} />);
    expect(screen.getByText('No hay datos disponibles.')).toBeInTheDocument();
  });

  it('muestra mensaje de búsqueda vacía cuando hay texto de búsqueda', () => {
    render(<Lista columnas={columnas} datos={[]} textoBusqueda="xyz" />);
    expect(screen.getByText('No hay resultados para tu búsqueda.')).toBeInTheDocument();
  });
});

describe('Lista – estado de carga', () => {
  it('muestra skeleton (animación de carga) cuando cargando es true', () => {
    const { container } = render(<Lista columnas={columnas} datos={[]} cargando />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('no muestra los datos mientras está cargando', () => {
    render(<Lista columnas={columnas} datos={datos} cargando />);
    expect(screen.queryByText('Juan García')).not.toBeInTheDocument();
  });
});

describe('Lista – buscador', () => {
  it('no muestra el buscador por defecto', () => {
    render(<Lista columnas={columnas} datos={[]} />);
    expect(screen.queryByPlaceholderText('Buscar...')).not.toBeInTheDocument();
  });

  it('muestra el buscador cuando mostrarBuscador es true', () => {
    render(<Lista columnas={columnas} datos={[]} mostrarBuscador />);
    expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument();
  });

  it('llama a onCambioBusqueda al escribir en el buscador', () => {
    const onCambioBusqueda = vi.fn();
    render(<Lista columnas={columnas} datos={[]} mostrarBuscador onCambioBusqueda={onCambioBusqueda} />);
    fireEvent.change(screen.getByPlaceholderText('Buscar...'), { target: { value: 'Juan' } });
    expect(onCambioBusqueda).toHaveBeenCalledWith('Juan');
  });

  it('muestra el botón X para limpiar cuando hay texto de búsqueda', () => {
    render(<Lista columnas={columnas} datos={[]} mostrarBuscador textoBusqueda="Juan" />);
    expect(screen.getByRole('button', { name: '' })).toBeInTheDocument();
  });

  it('llama a onCambioBusqueda con cadena vacía al hacer click en X', () => {
    const onCambioBusqueda = vi.fn();
    render(
      <Lista columnas={columnas} datos={[]} mostrarBuscador
        textoBusqueda="Juan" onCambioBusqueda={onCambioBusqueda} />
    );
    // El botón X es el único botón cuando hay texto de búsqueda y sin paginación
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(onCambioBusqueda).toHaveBeenCalledWith('');
  });
});

describe('Lista – paginación', () => {
  it('no muestra paginación cuando hay 10 registros o menos', () => {
    render(<Lista columnas={columnas} datos={datos} totalRegistros={5} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('muestra botones de página cuando totalRegistros supera 10', () => {
    render(<Lista columnas={columnas} datos={datos} totalRegistros={25} paginaActual={1} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('llama a onCambioPagina al hacer click en un botón de página', () => {
    const onCambioPagina = vi.fn();
    render(
      <Lista columnas={columnas} datos={datos}
        totalRegistros={25} paginaActual={1} onCambioPagina={onCambioPagina} />
    );
    fireEvent.click(screen.getByText('2'));
    expect(onCambioPagina).toHaveBeenCalledWith(2);
  });
});
