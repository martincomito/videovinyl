import BarraSuperior from "../../components/BarraSuperior/BarraSuperior";
import MenuLateral from "../../components/MenuLateral/MenuLateral";
import Lista from "../../components/Lista/Lista";
import { BarChart3 } from "lucide-react";
import transacciones from "../../DATApruebasJSON/transacciones.json";
import "../../styles/variables.scss";

function ReportesPage() {
  
const columnas = [
  { key: "fechaHora", label: "Fecha/hora" },
  {
    key: "tipo",
    label: "Tipo",
    render: (valor) => {
      const clases = {
        Alquiler: "bg-cyan-100 text-cyan-700",
        Venta: "bg-green-100 text-green-700",
        Recargo: "bg-orange-100 text-orange-700",
      };
      return (
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${clases[valor] ?? "bg-slate-100 text-slate-600"}`}>
          {valor}
        </span>
      );
    },
  },
  { key: "detalle", label: "Detalle" },
  {
    key: "monto",
    label: "Monto",
    render: (valor) => (
      <span className="font-semibold">
        ${valor.toLocaleString("es-AR")}
      </span>
    ),
  },
];

    return (
      <>
        <BarraSuperior />

        <div className="flex 
                        bg-[var(--color-fondo-paginas-primario)]
                        h-[calc(100vh-50px)]">
        
        <MenuLateral />

          <main className="flex-1 p-6 overflow-auto">
          <div className="mb-5
                          flex
                          items-start
                          justify-between">

            <div>
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className=" text-[var(--color-primario)]"/>

                <h1 className="text-lg
                               font-semibold
                               text-[var(--color-texto-primario)]">Reportes e Historial EN DESARROLLO</h1>
            </div>
                
            <p className="mt-1
                          text-xs
                          text-[var(--color-texto-secundario)]">Análisis de ventas, alquileres y estado general del negocio.</p> 
          </div>
                           
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1
                               rounded-md
                               bg-[var(--color-boton-primario)]
                               px-4 py-2
                               text-xs font-medium
                               text-white
                               hover:opacity-90
                               cursor-pointer"> Exportar PDF
            </button>
          </div>
        </div>

        <Lista
          columnas={columnas}
          datos={transacciones}
          mostrarBuscador={false}
          titulo="Últimas Transacciones (General)"
        />

        </main>
      </div>
    </>
  );
}

export default ReportesPage;