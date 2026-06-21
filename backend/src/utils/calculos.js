export function calcularDiasAlquiler(fechaInicio, fechaFin) {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  return Math.max(1, Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24)));
}

export function calcularMontoAlquiler(dias, precioPorDia) {
  return parseFloat(precioPorDia) * dias;
}

export function calcularTotalVenta(items) {
  return items.reduce((acc, item) => acc + parseFloat(item.precio_unitario) * item.cantidad, 0);
}

export function normalizarPaginacion(pagina, limite) {
  const limit = Math.min(Math.max(parseInt(limite) || 10, 1), 100);
  const pg = Math.max(parseInt(pagina) || 1, 1);
  const offset = (pg - 1) * limit;
  return { limit, pg, offset };
}
