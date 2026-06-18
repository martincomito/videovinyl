import BarraSuperior from "../../components/BarraSuperior/BarraSuperior";
import MenuLateral from "../../components/MenuLateral/MenuLateral";
import TarjetaInfoSimple from "../../components/TarjetaInfoSimple/TarjetaInfoSimple";
import TarjetaInfoCompleta from "../../components/TarjetaInfoCompleta/TarjetaInfoCompleta";
import dashboard from "../../DATApruebasJSON/inicio.json";
import "../../styles/variables.scss";
import {
  TrendingUp,
  CalendarClock,
  Users,
  AlertCircle,
  ShoppingCart,
  CalendarPlus,
} from "lucide-react";

function InicioPage() {
  return (
    <>
      <BarraSuperior />

      <div
        className="
                    flex
                    bg-[var(--color-fondo-paginas-primario)]
                    h-[calc(100vh-50px)]
                "
      >
        <MenuLateral />

        <main
          className="
                        flex-1
                        p-6
                        overflow-auto
                    "
        >
          <div
            className="
                            mb-6
                            flex
                            items-start
                            justify-between
                        "
          >
            <div>
              <h1
                className="
                                    text-3xl
                                    font-bold
                                    text-[var(--color-texto-primario)]
                                "
              >
                Panel de Control
              </h1>

              <p
                className="
                                    mt-1
                                    text-sm
                                    text-[var(--color-texto-secundario)]
                                "
              >
                Resumen del estado actual de la tienda.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                className="
                                    flex
                                    items-center
                                    gap-2
                                    rounded-lg
                                    bg-[var(--color-boton-dashboard-primario)]
                                    px-4
                                    py-2
                                    text-sm
                                    font-medium
                                    text-white
                                    transition-opacity
                                    hover:opacity-90
                                    cursor-pointer
                                "
              >
                <ShoppingCart size={16} />
                Nueva Venta
              </button>

              <button
                className="
                                    flex
                                    items-center
                                    gap-2
                                    rounded-lg
                                    border
                                    border-[var(--color-card-borde)]
                                    bg-white
                                    px-4
                                    py-2
                                    text-sm
                                    font-medium
                                    cursor-pointer
                                    transition-opacity
                                    hover:opacity-90
                                "
              >
                <CalendarPlus size={16} />
                Nuevo Alquiler
              </button>
            </div>
          </div>

          <div
            className="
                            grid
                            gap-4
                            md:grid-cols-2
                            xl:grid-cols-4
                        "
          >
            <TarjetaInfoSimple
              titulo="Ventas de hoy"
              valor={dashboard.tarjetas.ventasHoy}
              icono={TrendingUp}
              colorIcono="bg-green-100"
              colorTextoIcono="text-green-600"
            />

            <TarjetaInfoSimple
              titulo="Alquileres activos"
              valor={dashboard.tarjetas.alquileresActivos}
              icono={CalendarClock}
              colorIcono="bg-sky-100"
              colorTextoIcono="text-sky-600"
            />

            <TarjetaInfoSimple
              titulo="Nuevos Clientes"
              valor={dashboard.tarjetas.nuevosClientes}
              icono={Users}
              colorIcono="bg-violet-100"
              colorTextoIcono="text-violet-600"
            />

            <TarjetaInfoSimple
              titulo="Stock Crítico"
              valor={dashboard.tarjetas.stockCritico}
              icono={AlertCircle}
              colorIcono="bg-red-100"
              colorTextoIcono="text-red-600"
            />
          </div>

          <div
            className="
                            mt-6
                            grid
                            gap-6
                            xl:grid-cols-2
                        "
          >
            <TarjetaInfoCompleta
              titulo="Ventas Recientes"
              botonTexto="Ver todas"
              items={dashboard.ventasRecientes}
              renderItem={(venta) => (
                <div
                  className="
                                        flex
                                        items-center
                                        justify-between
                                        px-4
                                        py-3
                                    "
                >
                  <div>
                    <p className="text-sm font-semibold">
                      Venta {venta.numero}
                    </p>

                    <p
                      className="
                                                text-xs
                                                text-[var(--color-texto-secundario)]
                                            "
                    >
                      {venta.producto}
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className="
                                                text-sm
                                                font-semibold
                                                text-green-600
                                            "
                    >
                      {venta.importe}
                    </p>

                    <p
                      className="
                                                text-xs
                                                text-[var(--color-texto-secundario)]
                                            "
                    >
                      {venta.tiempo}
                    </p>
                  </div>
                </div>
              )}
            />

            <TarjetaInfoCompleta
              titulo="Devoluciones Pendientes (Hoy)"
              botonTexto="Ver alquileres"
              items={dashboard.devolucionesPendientes}
              renderItem={(item) => (
                <div
                  className="
                                        flex
                                        items-center
                                        justify-between
                                        px-4
                                        py-3
                                    "
                >
                  <div className="flex gap-3">
                    <div
                      className="
                                                flex
                                                h-8
                                                w-8
                                                items-center
                                                justify-center
                                                rounded-md
                                                bg-red-100
                                                text-red-600
                                                text-[10px]
                                                font-bold
                                            "
                    >
                      VHS
                    </div>

                    <div>
                      <p className="text-sm font-semibold">
                        {item.cliente}
                      </p>

                      <p
                        className="
                                                    text-xs
                                                    text-[var(--color-texto-secundario)]
                                                "
                      >
                        {item.titulo}
                      </p>
                    </div>
                  </div>

                  <button
                    className="   
                                            rounded-md
                                            border
                                            border-[var(--color-card-borde)]
                                            px-3
                                            py-1.5
                                            text-xs
                                            font-medium
                                            cursor-pointer
                                            transition-opacity
                                            hover:opacity-90
                                        "
                  >
                    Registrar Devolución
                  </button>
                </div>
              )}
            />
          </div>
        </main>
      </div>
    </>
  );
}

export default InicioPage;