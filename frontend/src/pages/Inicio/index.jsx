import Boton from "../../components/Boton/Boton";
import BarraSuperior from "../../components/BarraSuperior/BarraSuperior";


function InicioPage() {
  return (
    <div>
      <BarraSuperior />

      Página de Inicio
      <Boton
        texto="Boton inicio"
        funcionClick={() => alert("boton alert")}
        variante="primario"
      />
    </div>
  );
}

export default InicioPage;
