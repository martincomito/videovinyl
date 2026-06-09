import "./BarraSuperior.scss";
import { Link } from "react-router-dom";

const BarraSuperior = () => {
    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

    return (
        <header className="barra-superior">
            <div className="barra-superior__logo">
                <Link to="/">
                    <img src={"/src/img/videovinyl-logo.png"} alt="VideoVinyl Logo" />
                </Link>
            </div>

            <div className="barra-superior__usuario">
                <div className="barra-superior__datos">
                    <span className="nombre">{usuario.nombre} {usuario.apellido}</span>
                    <span className="email">{usuario.email}</span>
                </div>

                <div className="barra-superior__avatar">
                    <Link to="/">
                        <img src={"/src/img/user-icon.jpg"} alt="USUARIO" />
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default BarraSuperior;
