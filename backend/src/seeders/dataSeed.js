import 'dotenv/config';
import bcrypt from 'bcrypt';
import {
  sequelize, Usuario, Cliente, Producto,
  MetodoPago, TarifaAlquiler, Venta, VentaProducto, Alquiler,
} from '../models/index.js';

await sequelize.authenticate();
console.log('Conectado. Iniciando seed...\n');

// ── Métodos de pago ──────────────────────────────────────────────────────────
const metodos = await Promise.all([
  'Efectivo', 'Tarjeta débito', 'Tarjeta crédito', 'Transferencia',
].map(nombre => MetodoPago.findOrCreate({ where: { nombre }, defaults: { activo: true } })));

const [efectivo, debito, credito, transferencia] = metodos.map(([m]) => m);
console.log('✓ Métodos de pago');

// ── Tarifas de alquiler ──────────────────────────────────────────────────────
await TarifaAlquiler.upsert({ tipo: 'DVD', precio_por_dia: 800 });
await TarifaAlquiler.upsert({ tipo: 'VHS', precio_por_dia: 500 });
console.log('✓ Tarifas de alquiler');

// ── Usuarios ─────────────────────────────────────────────────────────────────
const empleados = [
  { nombre: 'Laura',    apellido: 'Méndez',    email: 'laura.mendez@videovinyl.com' },
  { nombre: 'Pablo',    apellido: 'Fernández',  email: 'pablo.fernandez@videovinyl.com' },
  { nombre: 'Carla',    apellido: 'Rodríguez',  email: 'carla.rodriguez@videovinyl.com' },
  { nombre: 'Matías',   apellido: 'González',   email: 'matias.gonzalez@videovinyl.com' },
  { nombre: 'Sofía',    apellido: 'Martínez',   email: 'sofia.martinez@videovinyl.com' },
  { nombre: 'Diego',    apellido: 'López',      email: 'diego.lopez@videovinyl.com' },
  { nombre: 'Valeria',  apellido: 'Pérez',      email: 'valeria.perez@videovinyl.com' },
  { nombre: 'Facundo',  apellido: 'García',     email: 'facundo.garcia@videovinyl.com' },
  { nombre: 'Natalia',  apellido: 'Torres',     email: 'natalia.torres@videovinyl.com' },
  { nombre: 'Ramiro',   apellido: 'Sánchez',    email: 'ramiro.sanchez@videovinyl.com' },
  { nombre: 'Florencia',apellido: 'Díaz',       email: 'florencia.diaz@videovinyl.com' },
  { nombre: 'Sebastián',apellido: 'Ruiz',       email: 'sebastian.ruiz@videovinyl.com' },
];

const hash = await bcrypt.hash('Password1', 10);
const usuariosCreados = [];
for (const u of empleados) {
  const [usuario] = await Usuario.findOrCreate({
    where: { email: u.email },
    defaults: { ...u, password: hash, rol: 'empleado', estado: 'activo', debe_cambiar_password: false },
  });
  usuariosCreados.push(usuario);
}
console.log('✓ Usuarios empleados (password: Password1)');

// ── Clientes ─────────────────────────────────────────────────────────────────
const clientesData = [
  { nombre: 'Ana',       apellido: 'Bogado',     dni: '28541230', telefono: '1145231890', email: 'ana.bogado@gmail.com' },
  { nombre: 'Carlos',    apellido: 'Villalba',   dni: '31204567', telefono: '1167893412', email: 'carlos.villalba@gmail.com' },
  { nombre: 'María',     apellido: 'Acosta',     dni: '25678901', telefono: '1134562378', email: 'maria.acosta@hotmail.com' },
  { nombre: 'Roberto',   apellido: 'Herrera',    dni: '29345678', telefono: '1156781234', email: 'roberto.herrera@gmail.com' },
  { nombre: 'Patricia',  apellido: 'Romero',     dni: '33112345', telefono: '1178904567', email: 'patriciaromero@yahoo.com' },
  { nombre: 'Jorge',     apellido: 'Medina',     dni: '27890123', telefono: '1189012345', email: 'jorge.medina@gmail.com' },
  { nombre: 'Claudia',   apellido: 'Suárez',     dni: '30567890', telefono: '1190123456', email: 'claudia.suarez@gmail.com' },
  { nombre: 'Marcelo',   apellido: 'Pereyra',    dni: '26234567', telefono: '1101234567', email: 'marcelo.pereyra@hotmail.com' },
  { nombre: 'Sandra',    apellido: 'Molina',     dni: '34789012', telefono: '1112345678', email: 'smolina@gmail.com' },
  { nombre: 'Gustavo',   apellido: 'Benítez',    dni: '22345678', telefono: '1123456789', email: 'gustavo.benitez@gmail.com' },
  { nombre: 'Adriana',   apellido: 'Castro',     dni: '31901234', telefono: '1134567890', email: 'adriana.castro@gmail.com' },
  { nombre: 'Fernando',  apellido: 'Morales',    dni: '28012345', telefono: '1145678901', email: 'fernando.morales@hotmail.com' },
  { nombre: 'Verónica',  apellido: 'Giménez',    dni: '35456789', telefono: '1156789012', email: 'verogimenez@hotmail.com' },
  { nombre: 'Alejandro', apellido: 'Ríos',       dni: '24123456', telefono: '1167890123', email: 'alejandro.rios@gmail.com' },
  { nombre: 'Beatriz',   apellido: 'Álvarez',    dni: '29678901', telefono: '1178901234', email: 'beatriz.alvarez@gmail.com' },
  { nombre: 'Horacio',   apellido: 'Núñez',      dni: '27234567', telefono: '1189012346', email: 'horacio.nunez@gmail.com' },
  { nombre: 'Graciela',  apellido: 'Vega',       dni: '32890123', telefono: '1190123457', email: 'gracielavega@gmail.com' },
  { nombre: 'Ricardo',   apellido: 'Flores',     dni: '23456789', telefono: '1101234568', email: 'ricardo.flores@hotmail.com' },
  { nombre: 'Silvia',    apellido: 'Cabrera',    dni: '36012345', telefono: '1112345679', email: 'silvia.cabrera@gmail.com' },
  { nombre: 'Néstor',    apellido: 'Palacios',   dni: '25789012', telefono: '1123456780', email: 'nestor.palacios@gmail.com' },
  { nombre: 'Miriam',    apellido: 'Ibáñez',     dni: '30345678', telefono: '1134567891', email: 'miriam.ibanez@hotmail.com' },
  { nombre: 'Osvaldo',   apellido: 'Vera',       dni: '28901234', telefono: '1145678902', email: 'osvaldo.vera@gmail.com' },
  { nombre: 'Roxana',    apellido: 'Paredes',    dni: '33567890', telefono: '1156789013', email: 'roxana.paredes@gmail.com' },
  { nombre: 'Leandro',   apellido: 'Aguirre',    dni: '24678901', telefono: '1167890124', email: 'leandro.aguirre@hotmail.com' },
  { nombre: 'Norma',     apellido: 'Delgado',    dni: '31123456', telefono: '1178901235', email: 'norma.delgado@gmail.com' },
];

const clientesCreados = [];
for (const c of clientesData) {
  const [cliente] = await Cliente.findOrCreate({ where: { dni: c.dni }, defaults: { ...c, estado: 'activo' } });
  clientesCreados.push(cliente);
}
console.log('✓ Clientes');

// ── Productos ─────────────────────────────────────────────────────────────────
const productosData = [
  { titulo: 'El Padrino',             tipo: 'DVD',    precio_venta: 3500, stock: 5  },
  { titulo: 'Titanic',                tipo: 'DVD',    precio_venta: 2800, stock: 3  },
  { titulo: 'Matrix',                 tipo: 'DVD',    precio_venta: 3200, stock: 4  },
  { titulo: 'Pulp Fiction',           tipo: 'DVD',    precio_venta: 3000, stock: 6  },
  { titulo: 'El Rey León',            tipo: 'DVD',    precio_venta: 2500, stock: 8  },
  { titulo: 'Forrest Gump',           tipo: 'VHS',    precio_venta: 1500, stock: 3  },
  { titulo: 'Terminator 2',           tipo: 'VHS',    precio_venta: 1800, stock: 2  },
  { titulo: 'Jurassic Park',          tipo: 'VHS',    precio_venta: 1600, stock: 4  },
  { titulo: 'El Silencio de los Inocentes', tipo: 'VHS', precio_venta: 1400, stock: 2 },
  { titulo: 'Beetlejuice',            tipo: 'VHS',    precio_venta: 1700, stock: 3  },
  { titulo: 'Dark Side of the Moon',  tipo: 'VINILO', precio_venta: 8500, stock: 2  },
  { titulo: 'Abbey Road',             tipo: 'VINILO', precio_venta: 9000, stock: 1  },
  { titulo: 'Thriller',               tipo: 'VINILO', precio_venta: 7500, stock: 3  },
  { titulo: 'Led Zeppelin IV',        tipo: 'VINILO', precio_venta: 8000, stock: 2  },
  { titulo: 'Nevermind',              tipo: 'VINILO', precio_venta: 7000, stock: 4  },
  { titulo: 'Back in Black',          tipo: 'VINILO', precio_venta: 7200, stock: 3  },
  { titulo: 'Rumors',                 tipo: 'VINILO', precio_venta: 6800, stock: 2  },
  { titulo: 'OK Computer',            tipo: 'CD',     precio_venta: 2200, stock: 5  },
  { titulo: 'The Wall',               tipo: 'CD',     precio_venta: 2500, stock: 4  },
  { titulo: 'Graceland',              tipo: 'CD',     precio_venta: 2000, stock: 6  },
  { titulo: 'Kind of Blue',           tipo: 'CD',     precio_venta: 2300, stock: 3  },
  { titulo: 'Violator',               tipo: 'CD',     precio_venta: 2100, stock: 5  },
  { titulo: 'Soda Stereo - Dynamo',   tipo: 'CD',     precio_venta: 1900, stock: 7  },
  { titulo: 'Charly García - Clics Modernos', tipo: 'VINILO', precio_venta: 9500, stock: 1 },
  { titulo: 'Los Fabulosos Cadillacs - El León', tipo: 'CD', precio_venta: 1800, stock: 6 },
];

const productosCreados = [];
for (const p of productosData) {
  const [producto] = await Producto.findOrCreate({
    where: { titulo: p.titulo, tipo: p.tipo },
    defaults: { ...p, eliminado: false },
  });
  productosCreados.push(producto);
}
console.log('✓ Productos');

// ── Ventas ────────────────────────────────────────────────────────────────────
const metodosArray = [efectivo, debito, credito, transferencia];

const ventasData = [
  { ci: 0,  ui: 0,  mi: 0, items: [{ pi: 0, q: 1 }, { pi: 4, q: 2 }] },
  { ci: 1,  ui: 1,  mi: 1, items: [{ pi: 10, q: 1 }] },
  { ci: 2,  ui: 2,  mi: 2, items: [{ pi: 2, q: 1 }, { pi: 17, q: 1 }] },
  { ci: 3,  ui: 3,  mi: 3, items: [{ pi: 12, q: 1 }] },
  { ci: 4,  ui: 4,  mi: 0, items: [{ pi: 5, q: 1 }, { pi: 6, q: 1 }] },
  { ci: 5,  ui: 5,  mi: 1, items: [{ pi: 11, q: 1 }] },
  { ci: 6,  ui: 6,  mi: 2, items: [{ pi: 3, q: 2 }] },
  { ci: 7,  ui: 7,  mi: 3, items: [{ pi: 18, q: 1 }, { pi: 19, q: 1 }] },
  { ci: 8,  ui: 8,  mi: 0, items: [{ pi: 13, q: 1 }] },
  { ci: 9,  ui: 9,  mi: 1, items: [{ pi: 1, q: 1 }, { pi: 20, q: 1 }] },
  { ci: 10, ui: 10, mi: 2, items: [{ pi: 14, q: 1 }] },
  { ci: 11, ui: 11, mi: 3, items: [{ pi: 22, q: 2 }] },
  { ci: 12, ui: 0,  mi: 0, items: [{ pi: 7, q: 1 }] },
  { ci: 13, ui: 1,  mi: 1, items: [{ pi: 15, q: 1 }, { pi: 21, q: 1 }] },
  { ci: 14, ui: 2,  mi: 2, items: [{ pi: 16, q: 1 }] },
  { ci: 15, ui: 3,  mi: 3, items: [{ pi: 0, q: 1 }, { pi: 23, q: 1 }] },
  { ci: 16, ui: 4,  mi: 0, items: [{ pi: 24, q: 1 }] },
  { ci: 17, ui: 5,  mi: 1, items: [{ pi: 8, q: 1 }, { pi: 9, q: 1 }] },
  { ci: 18, ui: 6,  mi: 2, items: [{ pi: 2, q: 1 }] },
  { ci: 19, ui: 7,  mi: 3, items: [{ pi: 11, q: 1 }] },
  { ci: 20, ui: 8,  mi: 0, items: [{ pi: 4, q: 1 }, { pi: 17, q: 1 }] },
  { ci: 21, ui: 9,  mi: 1, items: [{ pi: 13, q: 1 }] },
  { ci: 22, ui: 10, mi: 2, items: [{ pi: 3, q: 1 }] },
  { ci: 23, ui: 11, mi: 3, items: [{ pi: 12, q: 1 }, { pi: 18, q: 1 }] },
  { ci: 24, ui: 0,  mi: 0, items: [{ pi: 14, q: 2 }] },
];

for (const v of ventasData) {
  const items = v.items.map(i => ({
    producto: productosCreados[i.pi],
    cantidad: i.q,
  }));
  const total = items.reduce((s, i) => s + Number(i.producto.precio_venta) * i.cantidad, 0);

  const venta = await Venta.create({
    clienteId: clientesCreados[v.ci].id,
    usuarioId: usuariosCreados[v.ui].id,
    metodoPagoId: metodosArray[v.mi].id,
    total,
    estado: 'completada',
  });

  for (const i of items) {
    await VentaProducto.create({
      ventaId: venta.id,
      productoId: i.producto.id,
      cantidad: i.cantidad,
      precio_unitario: i.producto.precio_venta,
    });
  }
}
console.log('✓ Ventas');

// ── Alquileres ────────────────────────────────────────────────────────────────
const alquilablesIds = productosCreados
  .filter(p => ['DVD', 'VHS'].includes(p.tipo))
  .map(p => p.id);

const alquileresData = [
  { ci: 0,  pi: 0, ui: 0,  mi: 0, dias: 3,  estado: 'devuelto',  devReal: 2 },
  { ci: 1,  pi: 1, ui: 1,  mi: 1, dias: 5,  estado: 'activo',    devReal: null },
  { ci: 2,  pi: 2, ui: 2,  mi: 2, dias: 7,  estado: 'devuelto',  devReal: 6 },
  { ci: 3,  pi: 3, ui: 3,  mi: 3, dias: 3,  estado: 'vencido',   devReal: null },
  { ci: 4,  pi: 4, ui: 4,  mi: 0, dias: 4,  estado: 'devuelto',  devReal: 4 },
  { ci: 5,  pi: 5, ui: 5,  mi: 1, dias: 5,  estado: 'activo',    devReal: null },
  { ci: 6,  pi: 6, ui: 6,  mi: 2, dias: 3,  estado: 'devuelto',  devReal: 3 },
  { ci: 7,  pi: 7, ui: 7,  mi: 3, dias: 6,  estado: 'vencido',   devReal: null },
  { ci: 8,  pi: 8, ui: 8,  mi: 0, dias: 2,  estado: 'activo',    devReal: null },
  { ci: 9,  pi: 9, ui: 9,  mi: 1, dias: 4,  estado: 'devuelto',  devReal: 4 },
  { ci: 10, pi: 0, ui: 10, mi: 2, dias: 3,  estado: 'activo',    devReal: null },
  { ci: 11, pi: 1, ui: 11, mi: 3, dias: 7,  estado: 'devuelto',  devReal: 5 },
  { ci: 12, pi: 2, ui: 0,  mi: 0, dias: 5,  estado: 'vencido',   devReal: null },
  { ci: 13, pi: 3, ui: 1,  mi: 1, dias: 3,  estado: 'devuelto',  devReal: 3 },
  { ci: 14, pi: 4, ui: 2,  mi: 2, dias: 4,  estado: 'activo',    devReal: null },
  { ci: 15, pi: 5, ui: 3,  mi: 3, dias: 6,  estado: 'devuelto',  devReal: 7 },
  { ci: 16, pi: 6, ui: 4,  mi: 0, dias: 2,  estado: 'activo',    devReal: null },
  { ci: 17, pi: 7, ui: 5,  mi: 1, dias: 5,  estado: 'vencido',   devReal: null },
  { ci: 18, pi: 8, ui: 6,  mi: 2, dias: 3,  estado: 'devuelto',  devReal: 2 },
  { ci: 19, pi: 9, ui: 7,  mi: 3, dias: 4,  estado: 'activo',    devReal: null },
  { ci: 20, pi: 0, ui: 8,  mi: 0, dias: 7,  estado: 'devuelto',  devReal: 6 },
  { ci: 21, pi: 1, ui: 9,  mi: 1, dias: 3,  estado: 'activo',    devReal: null },
  { ci: 22, pi: 2, ui: 10, mi: 2, dias: 5,  estado: 'vencido',   devReal: null },
  { ci: 23, pi: 3, ui: 11, mi: 3, dias: 4,  estado: 'devuelto',  devReal: 4 },
  { ci: 24, pi: 4, ui: 0,  mi: 0, dias: 6,  estado: 'activo',    devReal: null },
];

const hoy = new Date();
const alquilablesProductos = productosCreados.filter(p => ['DVD', 'VHS'].includes(p.tipo));

for (const a of alquileresData) {
  const producto = alquilablesProductos[a.pi % alquilablesProductos.length];
  const tarifaPorDia = producto.tipo === 'DVD' ? 800 : 500;
  const inicio = new Date(hoy);
  inicio.setDate(inicio.getDate() - a.dias - 2);
  const esperada = new Date(inicio);
  esperada.setDate(esperada.getDate() + a.dias);
  const realDate = a.devReal !== null ? new Date(inicio) : null;
  if (realDate) realDate.setDate(realDate.getDate() + a.devReal);

  await Alquiler.create({
    clienteId: clientesCreados[a.ci].id,
    productoId: producto.id,
    usuarioId: usuariosCreados[a.ui].id,
    metodoPagoId: metodosArray[a.mi].id,
    fecha_inicio: inicio.toISOString().split('T')[0],
    fecha_devolucion_esperada: esperada.toISOString().split('T')[0],
    fecha_devolucion_real: realDate ? realDate.toISOString().split('T')[0] : null,
    monto: tarifaPorDia * a.dias,
    estado: a.estado,
    recargo_cobrado: a.estado === 'vencido' ? false : null,
    estado_producto_devuelto: a.devReal !== null ? 'bueno' : null,
  });
}
console.log('✓ Alquileres');

await sequelize.close();
console.log('\n¡Seed completado exitosamente!');
console.log('Resumen:');
console.log(`  • Métodos de pago:  4`);
console.log(`  • Tarifas:          2 (DVD y VHS)`);
console.log(`  • Usuarios:         ${usuariosCreados.length} empleados (password: Password1)`);
console.log(`  • Clientes:         ${clientesCreados.length}`);
console.log(`  • Productos:        ${productosCreados.length}`);
console.log(`  • Ventas:           ${ventasData.length}`);
console.log(`  • Alquileres:       ${alquileresData.length}`);
