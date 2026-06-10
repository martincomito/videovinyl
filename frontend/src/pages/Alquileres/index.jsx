import BarraSuperior from "../../components/BarraSuperior/BarraSuperior";
import MenuLateral from "../../components/MenuLateral/MenuLateral";
import Lista from "../../components/Lista/Lista";
import alquileres from "../../DATApruebasJSON/alquileres.json";
import "../../styles/variables.scss";

function AlquileresPage() {
  const columnas = [
        { key: "codigo", label: "ID" },
        { key: "clienteNombre", label: "Cliente" },
        { key: "producto", label: "Producto" },
        { key: "fechaRetiro", label: "Retiro",
            render: (valor) => valor.split("-").reverse().join("-"),
        },
        { key: "fechaVencimiento", label: "Vencimiento",
            render: (valor) => valor.split("-").reverse().join("-"),
        },
        {
            key: "estado",
            label: "Estado",
            render: (valor) => {
                const clases = {
                    Atrasado: "bg-red-100 text-red-600",
                    Activo:   "bg-green-100 text-green-700",
                    Devuelto: "bg-teal-100 text-teal-700",
                };
                return (
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${clases[valor] ?? "bg-slate-100 text-slate-600"}`}>
                        {valor}
                    </span>
                );
            },
        },
        {
            key: "acciones",
            label: "Acciones",
            render: (_, fila) =>
                fila.estado !== "Devuelto" ? (
                    <button
                        className="rounded border px-3 py-1 text-xs hover:bg-slate-50"
                        onClick={() => console.log("Devolver:", fila.id)}
                    >
                        Devolver
                    </button>
                ) : (
                    <span className="text-xs text-slate-400">Completado</span>
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

        <main className="flex-1 
                         p-6 
                         text-2xl 
                         font-bold 
                         text-[var(--color-texto-primario)]">
          <h1>Página de Alquileres EN DESARROLLO</h1>

          <Lista
            columnas={columnas}
            datos={alquileres}
            mostrarBuscador={true}
          />
        </main>
      </div>
    </>
  );
}

export default AlquileresPage;