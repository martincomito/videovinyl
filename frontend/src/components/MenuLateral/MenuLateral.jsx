import { Link, useLocation, useNavigate } from "react-router-dom";
import "../../styles/variables.scss";

import {
    House,
    ShoppingCart,
    CalendarDays,
    Package,
    Users,
    Settings,
    BarChart3,
    LogOut,
} from "lucide-react";

const MenuLateral = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        navigate("/login");
    };

    const items = [
        {
            texto: "Inicio",
            ruta: "/",
            icono: House,
        },
        {
            texto: "Ventas",
            ruta: "/ventas",
            icono: ShoppingCart,
        },
        {
            texto: "Alquileres",
            ruta: "/alquileres",
            icono: CalendarDays,
        },
        {
            texto: "Inventario",
            ruta: "/inventario",
            icono: Package,
        },
        {
            texto: "Clientes",
            ruta: "/clientes",
            icono: Users,
        },
        {
            texto: "Usuarios",
            ruta: "/usuarios",
            icono: Settings,
        },
        {
            texto: "Reportes",
            ruta: "/reportes",
            icono: BarChart3,
        },
    ];

    return (
        <aside
            className="
                flex
                flex-col
                justify-between
                w-[var(--ancho-menu-lateral)]
                h-full
                border-r
                border-[var(--color-menu-lateral-borde)]
                bg-[var(--color-menu-lateral-fondo)]
                text-[var(--color-texto-primario)]
            "
        >
            <div>
                <nav className="p-3">
                    <ul className="flex flex-col gap-1">
                        {items.map((item) => {
                            const Icono = item.icono;

                            return (
                                <li key={item.ruta}>
                                    <Link
                                        to={item.ruta}
                                        className={`
                                            flex
                                            items-center
                                            gap-3
                                            rounded-md
                                            px-3
                                            py-2
                                            text-sm
                                            transition-colors
                                            ${location.pathname === item.ruta
                                                ? "bg-[var(--color-menu-lateral-activo-fondo)] text-[var(--color-primario)]"
                                                : "hover:bg-[var(--color-menu-lateral-hover-fondo)]"
                                            }
                                        `}
                                    >
                                        <Icono size={18} />
                                        <span>{item.texto}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>

            <div
                className="
                    border-t
                    border-[var(--color-menu-lateral-borde)]
                    p-3
                "
            >
                <button
                    onClick={handleLogout}
                    className="
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-md
                        px-3
                        py-2
                        text-sm
                        text-[var(--color-texto-primario)]
                        hover:bg-[var(--color-menu-lateral-hover-fondo)]
                    "
                >
                    <LogOut size={18} />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
};

export default MenuLateral;