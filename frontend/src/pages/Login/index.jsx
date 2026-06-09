import { Navigate } from "react-router-dom";
import "../../styles/variables.scss";
import TarjetaLogin from "../../components/TarjetaLogin/TarjetaLogin";

function LoginPage() {
    if (localStorage.getItem("token")) return <Navigate to="/" replace />;

    return (
        <>

            <div className="flex 
                      bg-[var(--color-fondo-paginas-primario)]
                      min-h-screen">
                <main className="flex-1 
                        justify-center 
                        items-center 
                        flex
                         p-6 
                         text-2xl 
                         font-bold 
                         text-[var(--color-texto-primario)]">
                    <TarjetaLogin/>
                </main>
            </div>
        </>
    );
}

export default LoginPage;