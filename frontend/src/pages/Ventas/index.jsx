import BarraSuperior from "../../components/BarraSuperior/BarraSuperior";
import MenuLateral from "../../components/MenuLateral/MenuLateral";
import Lista from "../../components/Lista/Lista";
import ventas from "../../DATApruebasJSON/ventas.json";
import { ShoppingCart, Eye } from "lucide-react";
import "../../styles/variables.scss";


function VentasPage() {
  const columnas = [
    {
      key: "numeroVenta",
      label: "N° Venta",
    },
    {
      key: "fechaHora",
      label: "Fecha y Hora",
    },
    {
      key: "cliente",
      label: "Cliente",
    },
    {
      key: "total",
      label: "Total",
    },
    {
      key: "estado",
      label: "Estado",
      render: (valor) => {
        const estilos = {
          Completado:
            "bg-green-100 text-green-700",
          Pendiente:
            "bg-green-100 text-green-700",
          Anulado:
            "bg-red-100 text-red-700",
        };

        return (
          <span
            className={`
                            rounded-full
                            px-2
                            py-1
                            text-[10px]
                            font-medium
                            ${estilos[valor]}
                        `}
          >
            {valor}
          </span>
        );
      },
    },
    {
      key: "acciones",
      label: "Acciones",
      render: () => (
        <button
          className="
                        flex
                        items-center
                        gap-1
                        rounded
                        border
                        border-slate-300
                        px-2
                        py-1
                        text-xs
                        hover:bg-slate-50
                    "
        >
          <Eye size={12} />
          Ver Detalle
        </button>
      ),
    },
  ];

  return (
    <>
      <BarraSuperior />

      <div
        className="
                    flex
                    h-[calc(100vh-50px)]
                    bg-[var(--color-fondo-paginas-primario)]
                "
      >
        <MenuLateral />

        <main className="flex-1 p-6 overflow-auto">
          <div
            className="
                            mb-5
                            flex
                            items-start
                            justify-between
                        "
          >
            <div>
              <div className="flex items-center gap-2">
                <ShoppingCart
                  size={18}
                  className="
                                        text-[var(--color-primario)]
                                    "
                />

                <h1
                  className="
                                        text-lg
                                        font-semibold
                                        text-[var(--color-texto-primario)]
                                    "
                >
                  Gestión de Ventas
                </h1>
              </div>

              <p
                className="
                                    mt-1
                                    text-xs
                                    text-[var(--color-texto-secundario)]
                                "
              >
                Registra nuevas ventas y consulta el historial.
              </p>
            </div>

            <button
              className="
                                rounded-md
                                bg-[var(--color-boton-primario)]
                                px-4
                                py-2
                                text-xs
                                font-medium
                                text-white
                                transition-opacity
                                hover:opacity-90
                            "
            >
              + Nueva Venta
            </button>
          </div>


          <Lista
            columnas={columnas}
            datos={ventas}
            mostrarBuscador={true}
          />
        </main>
      </div>
    </>
  );
}

export default VentasPage;


