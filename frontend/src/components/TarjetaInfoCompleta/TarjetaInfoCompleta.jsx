import "../../styles/variables.scss";

function TarjetaInfoCompleta({
    titulo,
    botonTexto,
    onClickBoton,
    items = [],
    renderItem,
}) {
    return (
        <div
            className="
                rounded-xl
                border
                border-[var(--color-card-borde)]
                bg-white
            "
        >
            <div
                className="
                    flex
                    items-center
                    justify-between
                    border-b
                    border-[var(--color-card-borde)]
                    px-4
                    py-3
                "
            >
                <h2
                    className="
                        text-sm
                        font-semibold
                        text-[var(--color-texto-primario)]
                    "
                >
                    {titulo}
                </h2>

                {botonTexto && (
                    <button
                        onClick={onClickBoton}
                        className="
                            rounded-md
                            border
                            border-[var(--color-card-borde)]
                            px-3
                            py-1.5
                            text-xs
                            font-medium
                            cursor-pointer
                            hover:bg-slate-50
                        "
                    >
                        {botonTexto}
                    </button>
                )}
            </div>

            <div>
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="
                            border-b
                            border-[var(--color-card-borde)]
                            last:border-b-0
                        "
                    >
                        {renderItem(item)}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TarjetaInfoCompleta;