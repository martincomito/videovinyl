import "./BarraSuperior.scss";
import { Link } from "react-router-dom";

const BarraSuperior = () => {
  return (
    <header className="barra-superior">
      <div className="barra-superior__logo">
        <Link to="/">
          <img src={"/src/img/videovinyl-logo.png"} alt="VideoVinyl Logo" />
        </Link>
      </div>

      <div className="barra-superior__usuario">
        <div className="barra-superior__datos">
          <span className="nombre">Admin Usuario</span>
          <span className="email">admin@videovinyl.com</span>
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
