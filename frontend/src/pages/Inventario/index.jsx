import BarraSuperior from "../../components/BarraSuperior/BarraSuperior";
import MenuLateral from "../../components/MenuLateral/MenuLateral";
import Lista from "../../components/Lista/Lista";
import { Settings } from "lucide-react";
import inventario from "../../DATApruebasJSON/inventario.json";
import "../../styles/variables.scss";


function InventarioPage() {
  const columnas = [
        { key: "codigo", label: "Cód." },
        { key: "titulo", label: "Título" },
        {
            key: "formato",
            label: "Formato",
            render: (valor) => (
                <span className="rounded bg-slate-100 px-2 py-1 text-xs">{valor}</span>
            ),
        },
        {
            key: "stock",
            label: "Stock",
            render: (valor) => (
                <span className={valor === 0 ? "font-semibold text-red-500" : ""}>
                    {valor}
                </span>
            ),
        },
        {
            key: "precioAlquiler",
            label: "Precio Alquiler",
            render: (valor) => valor ? `$${valor.toLocaleString("es-AR")}` : "-",
        },
        {
            key: "precioVenta",
            label: "Precio Venta",
            render: (valor) => valor ? `$${valor.toLocaleString("es-AR")}` : "-",
        },
        {
            key: "estado",
            label: "Estado",
            render: (valor) => {
                const clases = {
                    "Disponible": "bg-green-100 text-green-700",
                    "Alquilado":  "bg-blue-100 text-blue-700",
                    "Agotado":    "bg-red-100 text-red-600",
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
            render: (_, fila) => (
                <div className="flex gap-2">
                    <button className="rounded border px-2 py-1 text-xs hover:bg-slate-50"
                        onClick={() => console.log("Editar:", fila.id)}>✏</button>
                    <button className="rounded border px-2 py-1 text-xs hover:bg-slate-50"
                        onClick={() => console.log("Eliminar:", fila.id)}>🗑</button>
                </div>
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
          <h1>Página de Inventario EN DESARROLLO</h1>
        
          <Lista
              columnas={columnas}
              datos={inventario}
              mostrarBuscador={true}
          />
        </main>
      </div>
    </>
  );
}

export default InventarioPage;