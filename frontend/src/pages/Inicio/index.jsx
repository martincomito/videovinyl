import Boton from "../../components/Boton/Boton";

function InicioPage() {
  return (
    <div>
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
