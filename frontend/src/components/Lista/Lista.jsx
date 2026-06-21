import { Search } from "lucide-react";
import "../../styles/variables.scss";

function Lista({
  columnas = [],
  datos = [],
  mostrarBuscador = false,
  titulo,
  placeholderBuscador = "Buscar...",
  totalRegistros = 0,
  paginaActual = 1,
  onCambioPagina,
  textoBusqueda = "",
  onCambioBusqueda,
  cargando = false,
}) {
  const registrosPorPagina = 10;
  const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);

  return (
    <div
      className="
        rounded-lg
        border
        border-[var(--color-lista-borde)]
        bg-[var(--color-lista-fondo)]
      "
    >
      {titulo && (
        <div className="px-4 pt-4 pb-2">
          <h2 className="text-sm font-semibold text-[var(--color-texto-primario)]">
            {titulo}
          </h2>
        </div>
      )}

      {mostrarBuscador && (
        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-[var(--color-lista-borde)]
            p-3
          "
        >
          <div className="relative w-full">
            <Search
              size={16}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />
            <input
              type="text"
              placeholder={placeholderBuscador}
              value={textoBusqueda}
              onChange={(e) => onCambioBusqueda?.(e.target.value)}
              className="
                w-full
                rounded-md
                border
                border-[var(--color-lista-borde)]
                py-2
                pl-10
                pr-3
                text-sm
                outline-none
                focus:border-[var(--color-primario)]
              "
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-lista-borde)]">
              {columnas.map((columna) => (
                <th
                  key={columna.key}
                  className="
                    px-4
                    py-3
                    text-left
                    text-[11px]
                    font-medium
                    uppercase
                    text-[var(--color-lista-encabezado)]
                  "
                >
                  {columna.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {cargando
              ? Array.from({ length: registrosPorPagina }, (_, i) => (
                  <tr
                    key={`skeleton-${i}`}
                    className="border-b border-[var(--color-lista-borde)]"
                  >
                    {columnas.map((columna) => (
                      <td key={columna.key} className="px-4 py-3">
                        <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                      </td>
                    ))}
                  </tr>
                ))
              : datos.length === 0
              ? (
                  <tr>
                    <td
                      colSpan={columnas.length}
                      className="px-4 py-10 text-center text-sm text-[var(--color-texto-secundario)]"
                    >
                      {textoBusqueda.trim()
                        ? "No hay resultados para tu búsqueda."
                        : "No hay datos disponibles."}
                    </td>
                  </tr>
                )
              : datos.map((fila) => (
                  <tr
                    key={fila.id}
                    className="border-b border-[var(--color-lista-borde)]"
                  >
                    {columnas.map((columna) => (
                      <td
                        key={columna.key}
                        className="px-4 py-3 text-sm"
                      >
                        {columna.render
                          ? columna.render(fila[columna.key], fila)
                          : fila[columna.key]}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 && (
        <div
          className="
            flex
            justify-center
            gap-2
            border-t
            border-[var(--color-lista-borde)]
            p-4
          "
        >
          {Array.from({ length: totalPaginas }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => onCambioPagina?.(index + 1)}
              className={`
                min-w-[34px]
                rounded-md
                px-3
                py-1
                text-sm
                transition-colors
                cursor-pointer
                ${
                  paginaActual === index + 1
                    ? "bg-[var(--color-primario)] text-white"
                    : "border border-slate-300 text-slate-500 hover:bg-slate-100"
                }
              `}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Lista;
