import { useState, useEffect, useRef } from "react";
import BarraSuperior from "../../components/BarraSuperior/BarraSuperior";
import MenuLateral from "../../components/MenuLateral/MenuLateral";
import Lista from "../../components/Lista/Lista";
import {
  BarChart3,
  Film,
  Tv2,
  Disc,
  Disc3,
  Calendar,
  FileDown,
  ChevronDown,
} from "lucide-react";
import { getReportes } from "../../api/reportes";
import { formatearFechaHora, formatearMonto } from "../../utils/format";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../../styles/variables.scss";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function toDateString(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatLabel(desde, hasta) {
  const hoy = toDateString(new Date());
  if (desde === hoy && hasta === hoy) return "Hoy";
  const fmt = (s) => s.split("-").reverse().join("/");
  if (desde === hasta) return fmt(desde);
  return `${fmt(desde)} – ${fmt(hasta)}`;
}

const HOY = toDateString(new Date());

const FORMATO_CONFIG = {
  DVD: { icono: Film, colorIcono: "bg-sky-100", colorTexto: "text-sky-600" },
  VHS: { icono: Tv2, colorIcono: "bg-cyan-100", colorTexto: "text-cyan-600" },
  CD: {
    icono: Disc,
    colorIcono: "bg-violet-100",
    colorTexto: "text-violet-600",
  },
  VINILO: {
    icono: Disc3,
    colorIcono: "bg-amber-100",
    colorTexto: "text-amber-600",
  },
};

const BADGE_TIPO = {
  Venta: "bg-green-100 text-green-700",
  Alquiler: "bg-cyan-100 text-cyan-700",
  Recargo: "bg-orange-100 text-orange-700",
};

const columnas = [
  {
    key: "fechaHora",
    label: "Fecha / Hora",
    render: (v) => (
      <span className="text-xs text-[var(--color-texto-secundario)]">
        {formatearFechaHora(v)}
      </span>
    ),
  },
  {
    key: "tipo",
    label: "Tipo",
    render: (v) => (
      <span
        className={`rounded-full px-3 py-1 text-xs font-medium ${BADGE_TIPO[v] ?? "bg-slate-100 text-slate-600"}`}
      >
        {v}
      </span>
    ),
  },
  { key: "detalle", label: "Detalle" },
  {
    key: "monto",
    label: "Monto",
    render: (v) => <span className="font-semibold">{formatearMonto(v)}</span>,
  },
];

function ReportesPage() {
  const [rango, setRango] = useState({ desde: HOY, hasta: HOY });
  const [borrador, setBorrador] = useState({ desde: HOY, hasta: HOY });
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [datos, setDatos] = useState({
    formatoCards: [],
    ingresosPorFormato: [],
    transacciones: [],
    productosStockBajo: [],
  });
  const [cargando, setCargando] = useState(true);

  const panelRef = useRef(null);

  // Cerrar panel al hacer click fuera
  useEffect(() => {
    if (!panelAbierto) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setPanelAbierto(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [panelAbierto]);

  // Fetch cuando cambia el rango confirmado
  useEffect(() => {
    setCargando(true);
    getReportes(rango.desde, rango.hasta)
      .then(({ data }) => setDatos(data))
      .catch(console.error)
      .finally(() => setCargando(false));
  }, [rango]);

  const abrirPanel = () => {
    setBorrador(rango);
    setPanelAbierto(true);
  };

  const aplicar = () => {
    setRango(borrador);
    setPanelAbierto(false);
  };

  const resetearHoy = () => {
    setBorrador({ desde: HOY, hasta: HOY });
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    const AZUL = [79, 70, 229];
    const rangoLabel = formatLabel(rango.desde, rango.hasta);

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("VideoVinyl - Reporte de Ventas", 14, 18);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Período: ${rangoLabel}`, 14, 26);
    doc.setTextColor(0);

    // Ventas por formato
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Ventas por formato", 14, 36);

    autoTable(doc, {
      startY: 40,
      head: [["Formato", "Unidades vendidas"]],
      body: formatoCards.map((r) => [r.tipo, r.cantidadVendida]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: AZUL },
    });

    const y1 = doc.lastAutoTable.finalY + 10;

    // Ingresos por formato
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Ingresos por formato", 14, y1);

    autoTable(doc, {
      startY: y1 + 4,
      head: [["Formato", "Total ingresos"]],
      body: ingresosPorFormato.map((r) => [
        r.tipo,
        `$${(r.total ?? 0).toLocaleString("es-AR")}`,
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: AZUL },
    });

    const y2 = doc.lastAutoTable.finalY + 10;

    // Transacciones
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Últimas transacciones", 14, y2);

    autoTable(doc, {
      startY: y2 + 4,
      head: [["Fecha / Hora", "Tipo", "Detalle", "Monto"]],
      body: transacciones.map((t) => [
        formatearFechaHora(t.fechaHora),
        t.tipo,
        t.detalle,
        `$${(t.monto ?? 0).toLocaleString("es-AR")}`,
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: AZUL },
      columnStyles: { 2: { cellWidth: 70 } },
    });

    const y3 = doc.lastAutoTable.finalY + 10;

    // Stock bajo
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Productos con stock bajo", 14, y3);

    autoTable(doc, {
      startY: y3 + 4,
      head: [["Título", "Tipo", "Stock"]],
      body: productosStockBajo.length
        ? productosStockBajo.map((p) => [p.titulo, p.tipo, p.stock])
        : [["Sin productos con stock bajo", "", ""]],
      styles: { fontSize: 10 },
      headStyles: { fillColor: AZUL },
    });

    doc.save(`reporte-videovinyl-${rango.desde}-${rango.hasta}.pdf`);
  };

  const {
    formatoCards,
    ingresosPorFormato,
    transacciones,
    productosStockBajo,
  } = datos;

  const COLORES_BARRA = {
    DVD: "rgb(14,165,233)",
    VHS: "rgb(6,182,212)",
    CD: "rgb(139,92,246)",
    VINILO: "rgb(245,158,11)",
  };

  const chartData = {
    labels: ingresosPorFormato.map((r) => r.tipo),
    datasets: [
      {
        data: ingresosPorFormato.map((r) => r.total),
        backgroundColor: ingresosPorFormato.map(
          (r) => COLORES_BARRA[r.tipo] ?? "rgb(100,116,139)",
        ),
        borderRadius: 6,
        maxBarThickness: 56,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (item) => ` $${item.raw.toLocaleString("es-AR")}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 12 } },
      },
      y: {
        grid: { color: "rgba(0,0,0,0.06)" },
        ticks: {
          font: { size: 11 },
          callback: (v) => `$${Number(v).toLocaleString("es-AR")}`,
        },
      },
    },
  };

  return (
    <>
      <BarraSuperior />

      <div className="flex bg-[var(--color-fondo-paginas-primario)] h-[calc(100vh-50px)]">
        <MenuLateral />

        <main className="flex-1 p-6 overflow-auto">
          {/* Encabezado */}
          <div className="mb-5 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-[var(--color-primario)]" />
                <h1 className="text-lg font-semibold text-[var(--color-texto-primario)]">
                  Reportes e Historial
                </h1>
              </div>
              <p className="mt-1 text-xs text-[var(--color-texto-secundario)]">
                Análisis de ventas, alquileres y estado general del negocio.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Selector de rango de fechas */}
              <div className="relative" ref={panelRef}>
                <button
                  onClick={abrirPanel}
                  className="flex items-center gap-1.5 rounded-md border border-[var(--color-lista-borde)] bg-white px-4 py-2 text-xs font-medium text-[var(--color-texto-primario)] hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <Calendar size={13} />
                  {formatLabel(rango.desde, rango.hasta)}
                  <ChevronDown size={12} className="text-slate-400" />
                </button>

                {panelAbierto && (
                  <div className="absolute right-0 top-full mt-1.5 z-50 w-72 rounded-xl border border-[var(--color-lista-borde)] bg-white p-4 shadow-lg">
                    <p className="text-xs font-semibold text-[var(--color-texto-primario)] mb-3">
                      Seleccionar rango
                    </p>

                    <div className="flex gap-3 mb-4">
                      <div className="flex flex-col gap-1 flex-1">
                        <label className="text-[11px] font-medium text-[var(--color-texto-secundario)]">
                          Desde
                        </label>
                        <input
                          type="date"
                          value={borrador.desde}
                          max={borrador.hasta}
                          onChange={(e) =>
                            setBorrador((prev) => ({
                              ...prev,
                              desde: e.target.value,
                            }))
                          }
                          className="modal-input text-xs"
                        />
                      </div>
                      <div className="flex flex-col gap-1 flex-1">
                        <label className="text-[11px] font-medium text-[var(--color-texto-secundario)]">
                          Hasta
                        </label>
                        <input
                          type="date"
                          value={borrador.hasta}
                          min={borrador.desde}
                          onChange={(e) =>
                            setBorrador((prev) => ({
                              ...prev,
                              hasta: e.target.value,
                            }))
                          }
                          className="modal-input text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={resetearHoy}
                        className="text-xs text-[var(--color-primario)] hover:underline"
                      >
                        Resetear a hoy
                      </button>
                      <button
                        type="button"
                        onClick={aplicar}
                        disabled={!borrador.desde || !borrador.hasta}
                        className="rounded-md bg-[var(--color-boton-primario)] px-4 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={exportarPDF}
                disabled={cargando}
                className="flex items-center gap-1.5 rounded-md bg-[var(--color-boton-primario)] px-4 py-2 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity cursor-pointer"
              >
                <FileDown size={13} />
                Exportar PDF
              </button>
            </div>
          </div>

          {/* Cards por formato */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {formatoCards.map(({ tipo, cantidadVendida }) => {
              const {
                icono: Icono,
                colorIcono,
                colorTexto,
              } = FORMATO_CONFIG[tipo] ?? {};
              return (
                <div
                  key={tipo}
                  className="flex items-center gap-4 rounded-xl border border-[var(--color-card-borde)] bg-[var(--color-card-fondo)] p-5"
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${colorIcono}`}
                  >
                    {Icono && <Icono size={22} className={colorTexto} />}
                  </div>
                  <div>
                    <p className="text-sm text-[var(--color-texto-secundario)]">
                      Ventas {tipo}
                    </p>
                    <h3 className="text-2xl font-bold text-[var(--color-texto-primario)]">
                      {cargando ? "—" : cantidadVendida}
                    </h3>
                    <p className="text-xs text-[var(--color-texto-secundario)]">
                      unidades
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gráfico de barras */}
          <div className="mb-6 rounded-xl border border-[var(--color-card-borde)] bg-[var(--color-card-fondo)] p-5">
            <p className="text-sm font-semibold text-[var(--color-texto-primario)] mb-4">
              Ingresos por formato
            </p>
            <div style={{ height: "220px" }}>
              {cargando ? (
                <div className="flex items-center justify-center h-full text-xs text-[var(--color-texto-secundario)]">
                  Cargando…
                </div>
              ) : (
                <Bar data={chartData} options={chartOptions} />
              )}
            </div>
          </div>

          {/* Stock bajo */}
          <div className="mb-6 rounded-xl border border-[var(--color-card-borde)] bg-[var(--color-card-fondo)] p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-[var(--color-texto-primario)]">
                Productos con stock bajo
              </p>
              {!cargando && (
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-600">
                  {productosStockBajo.length}{" "}
                  {productosStockBajo.length === 1 ? "producto" : "productos"}
                </span>
              )}
            </div>

            {cargando ? (
              <p className="text-xs text-[var(--color-texto-secundario)]">
                Cargando…
              </p>
            ) : productosStockBajo.length === 0 ? (
              <p className="text-xs text-[var(--color-texto-secundario)]">
                Sin productos con stock bajo.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[var(--color-lista-borde)]">
                      <th className="pb-2 text-left font-medium text-[var(--color-texto-secundario)]">
                        Título
                      </th>
                      <th className="pb-2 text-left font-medium text-[var(--color-texto-secundario)]">
                        Tipo
                      </th>
                      <th className="pb-2 text-right font-medium text-[var(--color-texto-secundario)]">
                        Stock
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosStockBajo.map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-[var(--color-lista-borde)] last:border-0"
                      >
                        <td className="py-2 text-[var(--color-texto-primario)]">
                          {p.titulo}
                        </td>
                        <td className="py-2 text-[var(--color-texto-secundario)]">
                          {p.tipo}
                        </td>
                        <td className="py-2 text-right">
                          <span
                            className={`font-semibold ${p.stock === 0 ? "text-red-600" : "text-orange-500"}`}
                          >
                            {p.stock}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Tabla de transacciones */}
          <Lista
            columnas={columnas}
            datos={transacciones}
            mostrarBuscador={false}
            titulo="Últimas Transacciones"
            cargando={cargando}
          />
        </main>
      </div>
    </>
  );
}

export default ReportesPage;
