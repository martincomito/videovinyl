import BarraSuperior from "../../components/BarraSuperior/BarraSuperior";
import MenuLateral from "../../components/MenuLateral/MenuLateral";
import Lista from "../../components/Lista/Lista";
import { Settings } from "lucide-react";

import "../../styles/variables.scss";

function UsuariosPage() {
    const columnas = [
        {
            key: "id",
            label: "ID",
        },
        {
            key: "nombre",
            label: "Nombre",
        },
        {
            key: "email",
            label: "Email",
        },
        {
            key: "rol",
            label: "Rol",
            render: (valor) => (
                <span
                    className="
                        rounded
                        bg-slate-100
                        px-2
                        py-1
                        text-xs
                    "
                >
                    {valor}
                </span>
            ),
        },
        {
            key: "estado",
            label: "Estado",
            render: (valor) => (
                <div
                    className={`
                        h-2
                        w-2
                        rounded-full
                        ${valor
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }
                    `}
                />
            ),
        },
        {
            key: "acciones",
            label: "Acciones",
            render: (_, fila) => (
                <button
                    className="
                        rounded
                        border
                        px-3
                        py-1
                        text-xs
                        hover:bg-slate-50
                    "
                    onClick={() =>
                        console.log(
                            "Gestionar usuario:",
                            fila.id
                        )
                    }
                >
                    Gestionar Permisos
                </button>
            ),
        },
    ];

    return (
        <>
            <BarraSuperior />

            <div
                className="
                    flex
                    h-[calc(100vh-50px)]
                    bg-[var(--color-fondo-paginas-primario)]
                "
            >
                <MenuLateral />

                <main className="flex-1 p-6 overflow-auto">
                    <div
                        className="
                            mb-5
                            flex
                            items-start
                            justify-between
                        "
                    >
                        <div>
                            <div className="flex items-center gap-2">
                                <Settings
                                    size={18}
                                    className="
                                        text-[var(--color-primario)]
                                    "
                                />

                                <h1
                                    className="
                                        text-lg
                                        font-semibold
                                        text-[var(--color-texto-primario)]
                                    "
                                >
                                    Configuración de Usuarios
                                </h1>
                            </div>

                            <p
                                className="
                                    mt-1
                                    text-xs
                                    text-[var(--color-texto-secundario)]
                                "
                            >
                                Administra el acceso y roles de los empleados
                                del sistema.
                            </p>
                        </div>

                        <button
                            className="
                                rounded-md
                                bg-[var(--color-boton-primario)]
                                px-4
                                py-2
                                text-xs
                                font-medium
                                text-white
                                transition-opacity
                                hover:opacity-90
                            "
                        >
                            + Añadir Usuario
                        </button>
                    </div>

                    <Lista
                        columnas={columnas}
                        mostrarBuscador={true}
                    />
                </main>
            </div>
        </>
    );
}

export default UsuariosPage;