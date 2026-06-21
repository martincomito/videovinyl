import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import logo from "../../img/videovinyl-logo.png";
import "../../styles/variables.scss";
import { login } from "../../api/auth.js";

function TarjetaLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [verPassword, setVerPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const { token, usuario } = await login(email, password);
            localStorage.setItem("token", token);
            localStorage.setItem("usuario", JSON.stringify(usuario));
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.error || "Error al iniciar sesión");
        } finally {
            setLoading(false);
        }
    };

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

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
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
                        type={verPassword ? "text" : "password"}
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="
                            w-full
                            rounded-md
                            border
                            border-[var(--color-login-input-borde)]
                            py-2.5
                            pl-10
                            pr-10
                            text-sm
                            outline-none
                            focus:border-[var(--color-login-input-focus)]
                        "
                    />
                    <button
                        type="button"
                        onClick={() => setVerPassword((v) => !v)}
                        tabIndex={-1}
                        className="
                            absolute
                            right-3
                            top-1/2
                            -translate-y-1/2
                            text-slate-400
                            hover:text-slate-600
                        "
                    >
                        {verPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                {error && (
                    <p className="text-sm text-red-500 text-center">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="
                        mt-2
                        w-full
                        rounded-md
                        bg-[var(--color-login-boton-fondo)]
                        py-3
                        text-sm
                        font-medium
                        text-white
                        transition-colors
                        hover:bg-[var(--color-login-boton-hover)]
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                    "
                >
                    {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </button>
            </form>
        </div>
    );
}

export default TarjetaLogin;
