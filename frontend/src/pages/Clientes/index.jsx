import BarraSuperior from "../../components/BarraSuperior/BarraSuperior";
import MenuLateral from "../../components/MenuLateral/MenuLateral";
import Lista from "../../components/Lista/Lista";
import clientes from "../../DATApruebasJSON/clientes.json";
import { User } from "lucide-react";
import "../../styles/variables.scss";

function ClientesPage() {
  const columnas = [
    { key: "nSocio", label: "ID" },
    { key: "nombre", label: "Cliente" },
    { key: "dni", label: "DNI" },
    { key: "email", label: "Email" },
    { key: "telefono", label: "Teléfono" },
    {
      key: "estado",
      label: "Estado",
      render: (valor) => {
        const clases = {
          "Con Deuda": "bg-red-100 text-red-600",
          Activo: "bg-green-100 text-green-700",
          Inactivo: "bg-slate-100 text-slate-600",
        };
        return (
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              clases[valor] ?? "bg-slate-100 text-slate-600"
            }`}
          >
            {valor}
          </span>
        );
      },
    },
    {
      key: "acciones",
      label: "Acciones",
      render: (_, fila) =>
        fila.estado === "Con Deuda" ? (
          <button
            className="rounded border px-3 py-1 text-xs hover:bg-slate-50 cursor-pointer"
            onClick={() => console.log("Cobrar:", fila.nSocio)}
          >
            Cobrar
          </button>
        ) : (
          <span className="text-xs text-slate-400">—</span>
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
                <User size={18} className=" text-[var(--color-primario)]"/>

                <h1 className="text-lg
                               font-semibold
                               text-[var(--color-texto-primario)]">Directorio de Clientes</h1>
            </div>
                
            <p className="mt-1
                          text-xs
                          text-[var(--color-texto-secundario)]">Registra nuevos clientes para el sistema de alquileres.</p> 
          </div>
                           
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1
                               rounded-md
                               bg-[var(--color-boton-primario)]
                               px-4 py-2
                               text-xs font-medium
                               text-white
                               hover:opacity-90
                               cursor-pointer"> + Nuevo Cliente
            </button>
          </div>
        </div>

        <Lista
          columnas={columnas}
          datos={clientes}
          mostrarBuscador={true}/>

        </main>
      </div>
    </>
 );
}

export default ClientesPage;