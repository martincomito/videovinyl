import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TarjetaInfo from './TarjetaInfoSimple.jsx';

const IconoMock = (props) => <svg data-testid="icono-tarjeta" {...props} />;

describe('TarjetaInfoSimple', () => {
  it('muestra el título', () => {
    render(<TarjetaInfo titulo="Ventas hoy" valor={42} icono={IconoMock} />);
    expect(screen.getByText('Ventas hoy')).toBeInTheDocument();
  });

  it('muestra el valor numérico', () => {
    render(<TarjetaInfo titulo="Clientes" valor={128} icono={IconoMock} />);
    expect(screen.getByText('128')).toBeInTheDocument();
  });

  it('renderiza el ícono recibido por prop', () => {
    render(<TarjetaInfo titulo="Stock" valor={5} icono={IconoMock} />);
    expect(screen.getByTestId('icono-tarjeta')).toBeInTheDocument();
  });

  it('ejecuta onClick al hacer click cuando se provee', () => {
    const handleClick = vi.fn();
    render(<TarjetaInfo titulo="Alquileres" valor={3} icono={IconoMock} onClick={handleClick} />);
    fireEvent.click(screen.getByText('Alquileres').closest('div'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('no lanza error si no se provee onClick', () => {
    expect(() =>
      render(<TarjetaInfo titulo="Sin click" valor={0} icono={IconoMock} />)
    ).not.toThrow();
  });

  it('muestra valores de string como valor', () => {
    render(<TarjetaInfo titulo="Estado" valor="Activo" icono={IconoMock} />);
    expect(screen.getByText('Activo')).toBeInTheDocument();
  });
});
