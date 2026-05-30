import BarraSuperior from "../../components/BarraSuperior/BarraSuperior";
import MenuLateral from "../../components/MenuLateral/MenuLateral";
import "../../styles/variables.scss";

function ReportesPage() {
    return (
        <>
            <BarraSuperior />

            <div className="flex 
                      bg-[var(--color-fondo-paginas-primario)]
                      min-h-screen">
                <MenuLateral />

                <main className="flex-1 
                                 p-6 
                                 text-2xl 
                                 font-bold 
                                 text-[var(--color-texto-primario)]">
                    <h1>Página de Reportes EN DESARROLLO</h1>
                </main>
            </div>
        </>
    );
}

export default ReportesPage;