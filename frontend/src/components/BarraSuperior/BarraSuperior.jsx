import { useState } from "react";
import { Link } from "react-router-dom";
import "./BarraSuperior.scss";
import ModalEditarUsuario from "../Modal/ModalEditarUsuario";

const BarraSuperior = () => {
    const [modalAbierto, setModalAbierto] = useState(false);
    const [version, setVersion] = useState(0);

    const raw = JSON.parse(localStorage.getItem("usuario") || "{}");

    const usuarioModal = {
        id: raw.id,
        _nombre: raw.nombre,
        _apellido: raw.apellido,
        _email: raw.email,
        _rol: raw.rol,
        _estado: raw.estado || "activo",
        _avatar: raw.avatar || "",
    };

    return (
        <>
            <header className="barra-superior">
                <div className="barra-superior__logo">
                    <Link to="/">
                        <img src={"/src/img/videovinyl-logo.png"} alt="VideoVinyl Logo" />
                    </Link>
                </div>

                <div
                    className="barra-superior__usuario"
                    onClick={() => setModalAbierto(true)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setModalAbierto(true)}
                >
                    <div className="barra-superior__datos">
                        <span className="nombre">{raw.nombre} {raw.apellido}</span>
                        <span className="email">{raw.email}</span>
                    </div>

                    <div className="barra-superior__avatar">
                        <img
                            src={raw.avatar || "/src/img/user-icon.jpg"}
                            alt="USUARIO"
                        />
                    </div>
                </div>
            </header>

            <ModalEditarUsuario
                isOpen={modalAbierto}
                onClose={() => setModalAbierto(false)}
                onSuccess={() => setVersion((v) => v + 1)}
                usuario={usuarioModal}
            />
        </>
    );
};

export default BarraSuperior;
