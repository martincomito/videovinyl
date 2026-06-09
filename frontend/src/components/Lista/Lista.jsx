import { Eye } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import "../../styles/variables.scss";

function Lista({
    columnas = [],
    datos = [],
    mostrarBuscador = false,
    placeholderBuscador = "Buscar...",
    valorBusqueda = "",
    onBusquedaChange = () => {},
    onVerDetalle = () => {},
}) {
    const obtenerClaseEstado = (estado) => {
        switch (estado?.toLowerCase()) {
            case "completado":
                return `
                    bg-[var(--color-lista-estado-completado-fondo)]
                    text-[var(--color-lista-estado-completado-texto)]
                `;

            case "pendiente":
                return `
                    bg-[var(--color-lista-estado-pendiente-fondo)]
                    text-[var(--color-lista-estado-pendiente-texto)]
                `;

            case "anulado":
                return `
                    bg-[var(--color-lista-estado-anulado-fondo)]
                    text-[var(--color-lista-estado-anulado-texto)]
                `;

            default:
                return `
                    bg-slate-100
                    text-slate-700
                `;
        }
    };

    return (
        <div
            className="
                overflow-hidden
                rounded-xl
                border
                border-[var(--color-lista-borde)]
                bg-[var(--color-lista-fondo)]
                shadow-sm
            "
        >
            {mostrarBuscador && (
                <div
                    className="
                        border-b
                        border-[var(--color-lista-borde)]
                        p-4
                    "
                >
                    <input
                        type="text"
                        value={valorBusqueda}
                        onChange={(e) =>
                            onBusquedaChange(e.target.value)
                        }
                        placeholder={placeholderBuscador}
                        className="
                            w-full
                            rounded-md
                            border
                            border-[var(--color-login-input-borde)]
                            px-4
                            py-2
                            text-sm
                            outline-none
                            focus:border-[var(--color-login-input-focus)]
                        "
                    />
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr
                            className="
                                bg-[var(--color-lista-header-fondo)]
                                border-b
                                border-[var(--color-lista-borde)]
                            "
                        >
                            {columnas.map((columna) => (
                                <th
                                    key={columna.key}
                                    className="
                                        px-6
                                        py-4
                                        text-left
                                        text-xs
                                        font-semibold
                                        uppercase
                                        tracking-wider
                                        text-[var(--color-lista-header-texto)]
                                    "
                                >
                                    {columna.label}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {datos.map((fila) => (
                            <tr
                                key={fila.id}
                                className="
                                    border-b
                                    border-[var(--color-lista-fila-borde)]
                                    hover:bg-[var(--color-lista-fila-hover)]
                                "
                            >
                                {columnas.map((columna) => {
                                    if (columna.key === "estado") {
                                        return (
                                            <td
                                                key={columna.key}
                                                className="
                                                    px-6
                                                    py-4
                                                    text-sm
                                                "
                                            >
                                                <span
                                                    className={`
                                                        rounded-full
                                                        px-3
                                                        py-1
                                                        text-xs
                                                        font-medium
                                                        ${obtenerClaseEstado(
                                                            fila.estado
                                                        )}
                                                    `}
                                                >
                                                    {fila.estado}
                                                </span>
                                            </td>
                                        );
                                    }

                                    if (columna.key === "acciones") {
                                        return (
                                            <td
                                                key={columna.key}
                                                className="
                                                    px-6
                                                    py-4
                                                "
                                            >
                                                <button
                                                    onClick={() =>
                                                        onVerDetalle(fila)
                                                    }
                                                    className="
                                                        flex
                                                        items-center
                                                        gap-2
                                                        rounded-md
                                                        border
                                                        border-[var(--color-lista-boton-borde)]
                                                        bg-[var(--color-lista-boton-fondo)]
                                                        px-3
                                                        py-2
                                                        text-xs
                                                        text-[var(--color-lista-boton-texto)]
                                                        transition-colors
                                                        hover:bg-[var(--color-lista-boton-hover)]
                                                    "
                                                >
                                                    <Eye size={14} />
                                                    Ver detalle
                                                </button>
                                            </td>
                                        );
                                    }

                                    return (
                                        <td
                                            key={columna.key}
                                            className="
                                                px-6
                                                py-4
                                                text-sm
                                                text-[var(--color-lista-texto)]
                                            "
                                        >
                                            {fila[columna.key]}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Lista;