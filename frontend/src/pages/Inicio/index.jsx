import BarraSuperior from "../../components/BarraSuperior/BarraSuperior";
import MenuLateral from "../../components/MenuLateral/MenuLateral";
import "../../styles/variables.scss";

function InicioPage() {
  return (
    <>
      <BarraSuperior />

      <div className="flex 
                      bg-[var(--color-fondo-paginas-primario)]
                      h-[calc(100vh-50px)]">
        <MenuLateral />

        <main className="flex-1 
                         p-6 
                         text-2xl 
                         font-bold 
                         text-[var(--color-texto-primario)]">
          <h1>Página de Inicio EN DESARROLLO</h1>
        </main>
      </div>
    </>
  );
}

export default InicioPage;