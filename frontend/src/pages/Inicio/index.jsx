import { useState, useEffect } from "react";
import BarraSuperior from "../../components/BarraSuperior/BarraSuperior";
import MenuLateral from "../../components/MenuLateral/MenuLateral";
import TarjetaInfoSimple from "../../components/TarjetaInfoSimple/TarjetaInfoSimple";
import TarjetaInfoCompleta from "../../components/TarjetaInfoCompleta/TarjetaInfoCompleta";
import ModalNuevaVenta from "../../components/Modal/ModalNuevaVenta";
import ModalNuevoAlquiler from "../../components/Modal/ModalNuevoAlquiler";
import ModalRegistrarDevolucion from "../../components/Modal/ModalRegistrarDevolucion";
import { getDashboard } from "../../api/dashboard";
import "../../styles/variables.scss";
import { useNavigate } from "react-router-dom";
import { TrendingUp, CalendarClock, Users, AlertCircle, ShoppingCart } from "lucide-react";

function tiempoRelativo(fecha) {
  const diff = Date.now() - new Date(fecha).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} día${d !== 1 ? "s" : ""}`;
}

function diasHasta(fecha) {
  const diff = new Date(fecha) - new Date(new Date().toDateString());
  const dias = Math.round(diff / (1000 * 60 * 60 * 24));
  if (dias < 0) return `Vencido hace ${Math.abs(dias)} día${Math.abs(dias) !== 1 ? "s" : ""}`;
  if (dias === 0) return "Vence hoy";
  if (dias === 1) return "Vence mañana";
  return `Vence en ${dias} días`;
}

const TARJETAS_INICIAL = {
  ventasHoy: 0,
  alquileresActivos: 0,
  nuevosClientes: 0,
  stockCritico: 0,
};

function InicioPage() {
  const navigate = useNavigate();
  const [modalVenta, setModalVenta] = useState(false);
  const [modalAlquiler, setModalAlquiler] = useState(false);
  const [modalDevolucion, setModalDevolucion] = useState(false);
  const [devolucionPreseleccionada, setDevolucionPreseleccionada] = useState(null);
  const [version, setVersion] = useState(0);
  const [datos, setDatos] = useState({ tarjetas: TARJETAS_INICIAL, ventasRecientes: [], devolucionesPendientes: [] });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setCargando(true);
    getDashboard()
      .then(({ data }) => setDatos(data))
      .catch(console.error)
      .finally(() => setCargando(false));
  }, [version]);

  const { tarjetas, ventasRecientes, devolucionesPendientes } = datos;

  return (
    <>
      <BarraSuperior />

      <div className="flex bg-[var(--color-fondo-paginas-primario)] h-[calc(100vh-50px)]">
        <MenuLateral />

        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-texto-primario)]">
                Panel de Control
              </h1>
              <p className="mt-1 text-sm text-[var(--color-texto-secundario)]">
                Resumen del estado actual de la tienda.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                className="flex items-center gap-1.5 rounded-md bg-[var(--color-boton-dashboard-primario)] px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90 cursor-pointer"
                onClick={() => setModalVenta(true)}
              >
                <ShoppingCart size={13} />
                Nueva Venta
              </button>

              <button
                className="flex items-center gap-1.5 rounded-md border border-[var(--color-card-borde)] bg-white px-4 py-2 text-xs font-medium cursor-pointer transition-colors hover:bg-slate-50"
                onClick={() => setModalAlquiler(true)}
              >
                <CalendarClock size={13} />
                Nuevo Alquiler
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <TarjetaInfoSimple
              titulo="Ventas de hoy"
              valor={cargando ? "—" : tarjetas.ventasHoy}
              icono={TrendingUp}
              colorIcono="bg-green-100"
              colorTextoIcono="text-green-600"
              onClick={() => navigate("/ventas")}
            />
            <TarjetaInfoSimple
              titulo="Alquileres activos"
              valor={cargando ? "—" : tarjetas.alquileresActivos}
              icono={CalendarClock}
              colorIcono="bg-sky-100"
              colorTextoIcono="text-sky-600"
              onClick={() => navigate("/alquileres")}
            />
            <TarjetaInfoSimple
              titulo="Nuevos clientes"
              valor={cargando ? "—" : tarjetas.nuevosClientes}
              icono={Users}
              colorIcono="bg-violet-100"
              colorTextoIcono="text-violet-600"
              onClick={() => navigate("/clientes")}
            />
            <TarjetaInfoSimple
              titulo="Stock crítico"
              valor={cargando ? "—" : tarjetas.stockCritico}
              icono={AlertCircle}
              colorIcono="bg-red-100"
              colorTextoIcono="text-red-600"
              onClick={() => navigate("/inventario")}
            />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <TarjetaInfoCompleta
              titulo="Ventas Recientes"
              botonTexto="Ver todas"
              onClickBoton={() => navigate("/ventas")}
              items={ventasRecientes}
              cargando={cargando}
              renderItem={(venta) => (
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">
                      Venta {venta.numero}
                    </p>
                    <p className="text-xs text-[var(--color-texto-secundario)]">
                      {venta.cliente} · {venta.producto}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">
                      ${(venta.total ?? 0).toLocaleString("es-AR")}
                    </p>
                    <p className="text-xs text-[var(--color-texto-secundario)]">
                      {tiempoRelativo(venta.fecha)}
                    </p>
                  </div>
                </div>
              )}
            />

            <TarjetaInfoCompleta
              titulo="Devoluciones Pendientes"
              botonTexto="Ver alquileres"
              onClickBoton={() => navigate("/alquileres")}
              items={devolucionesPendientes}
              cargando={cargando}
              renderItem={(item) => (
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">{item.clienteNombre}</p>
                    <p className="text-xs text-[var(--color-texto-secundario)]">
                      {item.titulo} · {item.tipo}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${item.vencido ? "text-red-500" : "text-sky-600"}`}>
                      {diasHasta(item.fechaDevolucion)}
                    </p>
                    <button
                      className="mt-1 rounded-md border border-[var(--color-card-borde)] px-3 py-1 text-xs font-medium cursor-pointer transition-colors hover:bg-slate-50"
                      onClick={() => {
                        setDevolucionPreseleccionada({ cliente: item._cliente, alquiler: item._alquiler });
                        setModalDevolucion(true);
                      }}
                    >
                      Devolver
                    </button>
                  </div>
                </div>
              )}
            />
          </div>
        </main>
      </div>

      <ModalNuevaVenta
        isOpen={modalVenta}
        onClose={() => setModalVenta(false)}
        onSuccess={() => setVersion((v) => v + 1)}
      />
      <ModalNuevoAlquiler
        isOpen={modalAlquiler}
        onClose={() => setModalAlquiler(false)}
        onSuccess={() => setVersion((v) => v + 1)}
      />
      <ModalRegistrarDevolucion
        isOpen={modalDevolucion}
        onClose={() => { setModalDevolucion(false); setDevolucionPreseleccionada(null); }}
        onSuccess={() => setVersion((v) => v + 1)}
        preseleccionada={devolucionPreseleccionada}
      />
    </>
  );
}

export default InicioPage;
