export function calcularAlquiler(fechaDevolucion, precioPorDia, ahora = new Date()) {
  if (!fechaDevolucion || !precioPorDia) return null;
  const fechaFin = new Date(fechaDevolucion);
  const dias = Math.max(1, Math.ceil((fechaFin - ahora) / (1000 * 60 * 60 * 24)));
  return { dias, total: dias * parseFloat(precioPorDia) };
}

export function calcularDiasRetraso(fechaEsperada, ahora = new Date()) {
  if (!fechaEsperada) return 0;
  const hoy = new Date(ahora);
  hoy.setHours(0, 0, 0, 0);
  const esperada = new Date(fechaEsperada);
  return Math.max(0, Math.ceil((hoy - esperada) / (1000 * 60 * 60 * 24)));
}

export function calcularTotalVenta(items) {
  return items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
}
