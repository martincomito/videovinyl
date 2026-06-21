export const formatearFechaHora = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const anio = d.getFullYear();
  const horas = String(d.getHours()).padStart(2, "0");
  const minutos = String(d.getMinutes()).padStart(2, "0");
  return `${dia}-${mes}-${anio} ${horas}:${minutos}`;
};

export const formatearMonto = (valor) => {
  if (valor === null || valor === undefined) return "-";
  return `$${parseFloat(valor).toLocaleString("es-AR")}`;
};
