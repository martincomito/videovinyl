import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import usuarios from "../../components/Lista/lista.json";
import "../../styles/variables.scss";

function Lista({
    columnas = [],
    datos = usuarios,
    mostrarBuscador = false,
}) {
    const registrosPorPagina = 10;

    const [paginaActual, setPaginaActual] = useState(1);
    const [textoBusqueda, setTextoBusqueda] = useState("");

    const datosFiltrados = useMemo(() => {
        if (!textoBusqueda.trim()) {
            return datos;
        }

        const texto = textoBusqueda.toLowerCase();

        return datos.filter((fila) =>
            Object.values(fila).some((valor) =>
                String(valor)
                    .toLowerCase()
                    .includes(texto)
            )
        );
    }, [datos, textoBusqueda]);

    const totalPaginas = Math.ceil(
        datosFiltrados.length / registrosPorPagina
    );

    const datosPaginados = useMemo(() => {
        const inicio =
            (paginaActual - 1) *
            registrosPorPagina;

        const fin =
            inicio + registrosPorPagina;

        return datosFiltrados.slice(
            inicio,
            fin
        );
    }, [
        datosFiltrados,
        paginaActual,
    ]);

    return (
        <div
            className="
                rounded-lg
                border
                border-[var(--color-lista-borde)]
                bg-[var(--color-lista-fondo)]
            "
        >
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
                    <div className="relative w-full max-w-md">
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
                            placeholder="Buscar..."
                            value={textoBusqueda}
                            onChange={(e) => {
                                setTextoBusqueda(
                                    e.target.value
                                );
                                setPaginaActual(1);
                            }}
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
                        <tr
                            className="
                                border-b
                                border-[var(--color-lista-borde)]
                            "
                        >
                            {columnas.map(
                                (columna) => (
                                    <th
                                        key={
                                            columna.key
                                        }
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
                                        {
                                            columna.label
                                        }
                                    </th>
                                )
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {datosPaginados.map(
                            (fila) => (
                                <tr
                                    key={
                                        fila.id
                                    }
                                    className="
                                        border-b
                                        border-[var(--color-lista-borde)]
                                    "
                                >
                                    {columnas.map(
                                        (
                                            columna
                                        ) => (
                                            <td
                                                key={
                                                    columna.key
                                                }
                                                className="
                                                    px-4
                                                    py-3
                                                    text-sm
                                                "
                                            >
                                                {columna.render
                                                    ? columna.render(
                                                        fila[
                                                        columna.key
                                                        ],
                                                        fila
                                                    )
                                                    : fila[
                                                    columna.key
                                                    ]}
                                            </td>
                                        )
                                    )}
                                </tr>
                            )
                        )}
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
                    {Array.from(
                        {
                            length:
                                totalPaginas,
                        },
                        (_, index) => (
                            <button
                                key={
                                    index + 1
                                }
                                onClick={() =>
                                    setPaginaActual(
                                        index +
                                        1
                                    )
                                }
                                className={`
                                    min-w-[34px]
                                    rounded-md
                                    px-3
                                    py-1
                                    text-sm
                                    transition-colors
                                    ${paginaActual ===
                                        index +
                                        1
                                        ? "bg-[var(--color-primario)] text-white"
                                        : "border hover:bg-slate-100"
                                    }
                                `}
                            >
                                {index + 1}
                            </button>
                        )
                    )}
                </div>
            )}
        </div>
    );
}

export default Lista;