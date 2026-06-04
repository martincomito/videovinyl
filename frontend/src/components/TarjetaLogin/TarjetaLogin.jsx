import { Link } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import logo from "../../img/videovinyl-logo.png";
import "../../styles/variables.scss";

function TarjetaLogin() {
    return (
        <div
            className="
                w-full
                max-w-md
                rounded-xl
                border
                border-[var(--color-login-card-borde)]
                bg-[var(--color-login-card-fondo)]
                shadow-xl
                px-6
                py-8
            "
        >
            <div className="flex justify-center mb-6">
                <img
                    src={logo}
                    alt="VideoVinyl"
                    className="w-64 object-contain"
                />
            </div>

        
            <form className="flex flex-col gap-4">
                <div className="relative">
                    <Mail
                        size={18}
                        className="
                            absolute
                            left-3
                            top-1/2
                            -translate-y-1/2
                            text-slate-400
                        "
                    />

                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        className="
                            w-full
                            rounded-md
                            border
                            border-[var(--color-login-input-borde)]
                            py-2.5
                            pl-10
                            pr-3
                            text-sm
                            outline-none
                            focus:border-[var(--color-login-input-focus)]
                        "
                    />
                </div>

                <div className="relative">
                    <Lock
                        size={18}
                        className="
                            absolute
                            left-3
                            top-1/2
                            -translate-y-1/2
                            text-slate-400
                        "
                    />

                    <input
                        type="password"
                        placeholder="Contraseña"
                        className="
                            w-full
                            rounded-md
                            border
                            border-[var(--color-login-input-borde)]
                            py-2.5
                            pl-10
                            pr-3
                            text-sm
                            outline-none
                            focus:border-[var(--color-login-input-focus)]
                        "
                    />
                </div>

                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            className="h-4 w-4"
                        />
                        Recordarme
                    </label>

                    <Link
                        to="/recuperar-password"
                        className="
                            text-[var(--color-login-link)]
                            hover:underline
                        "
                    >
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>

                <Link
                    to="/"
                    className="
                        mt-2
                        block
                        w-full
                        rounded-md
                        bg-[var(--color-login-boton-fondo)]
                        py-3
                        text-center
                        text-sm
                        font-medium
                        text-white
                        transition-colors
                        hover:bg-[var(--color-login-boton-hover)]
                    "
                >
                    Iniciar Sesión
                </Link>
            </form>
        </div>
    );
}

export default TarjetaLogin;