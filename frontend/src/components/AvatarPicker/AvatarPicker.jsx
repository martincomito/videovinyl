import { useRef } from "react";
import { Camera, X } from "lucide-react";

function iniciales(nombre, apellido) {
  const n = (nombre || "").trim()[0] || "";
  const a = (apellido || "").trim()[0] || "";
  return (n + a).toUpperCase() || "?";
}

function AvatarPicker({ value, onChange, nombre, apellido, size = 80 }) {
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleQuitar = (e) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        style={{ width: size, height: size }}
        className="relative rounded-full overflow-hidden border-2 border-dashed border-slate-300 hover:border-[var(--color-primario)] transition-colors bg-slate-100 flex items-center justify-center group cursor-pointer"
      >
        {value ? (
          <>
            <img src={value} alt="avatar" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera size={20} className="text-white" />
            </div>
          </>
        ) : (
          <>
            <span className="text-xl font-semibold text-slate-400 select-none transition-opacity group-hover:opacity-0">
              {iniciales(nombre, apellido)}
            </span>
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera size={20} className="text-slate-600" />
            </div>
          </>
        )}
      </button>
      {value ? (
        <button
          type="button"
          onClick={handleQuitar}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-red-500 transition-colors"
        >
          <X size={10} />
          Quitar foto
        </button>
      ) : (
        <span className="text-[11px] text-[var(--color-texto-secundario)]">
          Clic para agregar foto · máx. 5 MB
        </span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

export default AvatarPicker;
