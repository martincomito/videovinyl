import "./Boton.scss";

function Boton({
  texto = "texto por defecto",
  funcionClick = () => {
    console.log("click");
  },
  variante = "primaria",
}) {
  return (
    <button className={variante} onClick={funcionClick}>
      {texto}
    </button>
  );
}

export default Boton;
