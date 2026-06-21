import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Boton from './Boton.jsx';

describe('Boton', () => {
  it('renderiza el texto recibido por prop', () => {
    render(<Boton texto="Guardar" />);
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
  });

  it('aplica la clase CSS correspondiente a la variante', () => {
    render(<Boton texto="Cancelar" variante="secundaria" />);
    expect(screen.getByRole('button')).toHaveClass('secundaria');
  });

  it('usa "primaria" como variante por defecto', () => {
    render(<Boton texto="Default" />);
    expect(screen.getByRole('button')).toHaveClass('primaria');
  });

  it('ejecuta la función de click al ser presionado', () => {
    const mockClick = vi.fn();
    render(<Boton texto="Click" funcionClick={mockClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockClick).toHaveBeenCalledOnce();
  });

  it('no ejecuta la función si no fue presionado', () => {
    const mockClick = vi.fn();
    render(<Boton texto="Sin click" funcionClick={mockClick} />);
    expect(mockClick).not.toHaveBeenCalled();
  });
});
