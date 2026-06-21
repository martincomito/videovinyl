import "../../styles/variables.scss";

function TarjetaInfo({
    titulo,
    valor,
    icono: Icono,
    colorIcono = "bg-indigo-100",
    colorTextoIcono = "text-indigo-600",
    onClick,
}) {
    return (
        <div
            onClick={onClick}
            className={`
                flex
                items-center
                gap-4
                rounded-xl
                border
                border-[var(--color-card-borde)]
                bg-[var(--color-card-fondo)]
                p-5
                ${onClick ? "cursor-pointer hover:bg-slate-50 transition-colors" : ""}
            `}
        >
            <div
                className={`
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    ${colorIcono}
                `}
            >
                <Icono
                    size={22}
                    className={colorTextoIcono}
                />
            </div>

            <div>
                <p
                    className="
                        text-sm
                        text-[var(--color-texto-secundario)]
                    "
                >
                    {titulo}
                </p>

                <h3
                    className="
                        text-2xl
                        font-bold
                        text-[var(--color-texto-primario)]
                    "
                >
                    {valor}
                </h3>
            </div>
        </div>
    );
}

export default TarjetaInfo;