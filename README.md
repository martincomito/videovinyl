# VideoVinyl

Sistema de gestión para VideoVinyl, un videoclub que vende y alquila productos. Permite administrar clientes, stock, ventas y alquileres desde una interfaz web.

## Tecnologías

| Capa | Tecnología |
| --- | --- |
| Frontend | React 19 + Vite |
| Backend | Node.js + Express 5 |
| Base de datos | PostgreSQL 15 + Sequelize ORM |
| Infraestructura | Docker + Docker Compose |
| Testing (BE) | Vitest + Supertest |
| Testing (FE) | Vitest + React Testing Library + jsdom |

## Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado (incluye Docker Compose)

## Configuración inicial

1. Clonar el repositorio:

   ```bash
   git clone <url-del-repositorio>
   cd videovinyl
   ```

2. Crear el archivo de variables de entorno y completar los valores:

   ```bash
   cp .env.example .env
   ```

   | Variable         | Descripción                                           |
   | ---------------- | ----------------------------------------------------- |
   | `JWT_SECRET`     | Cadena larga y aleatoria usada para firmar los tokens |
   | `ADMIN_EMAIL`    | Email del usuario administrador inicial               |
   | `ADMIN_PASSWORD` | Contraseña del usuario administrador inicial          |

3. Levantar todos los servicios:

   ```bash
   docker compose up -d --build
   ```

4. Crear el usuario administrador inicial:

   ```bash
   docker exec videovinyl_backend node src/seeders/adminSeed.js
   ```

   Este comando solo necesita correrse una vez. Si se vuelve a correr, actualiza el usuario existente sin crear duplicados.

5. Acceder al sistema en [http://localhost:5173](http://localhost:5173) con las credenciales del `.env`.

> **Primer ingreso:** cualquier usuario nuevo debe cambiar su contraseña la primera vez que inicia sesión.

## Accesos

| Servicio      | URL                    |
| ------------- | ---------------------- |
| Frontend      | http://localhost:5173  |
| Backend (API) | http://localhost:3000  |
| Base de datos | localhost:5432         |

## Comandos frecuentes

```bash
# Iniciar todos los servicios
docker compose up -d

# Detener todos los servicios
docker compose down

# Ver logs del backend en tiempo real
docker compose logs -f backend

# Reiniciar el backend (tras cambios en .env)
docker compose up -d --force-recreate backend

# Reiniciar solo el backend
docker compose restart backend
```

## Tests

Las pruebas se corren localmente (sin Docker), dentro de cada carpeta:

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

Para correr un archivo de test específico:

```bash
npm test -- <nombre-del-archivo>

# Ejemplos
npm test -- calculos
npm test -- clienteIntegracion
npm test -- ClientesPage
```

Para modo watch (re-corre al guardar):

```bash
npm run test:watch
```

### Cobertura de tests

| Tipo | Archivo | Qué cubre |
| --- | --- | --- |
| Unitario (BE) | `src/utils/calculos.test.js` | Cálculo de días de alquiler, monto, total de venta, paginación |
| Unitario (FE) | `src/utils/calculos.test.js` | Cálculo de alquiler, días de retraso, total de venta |
| Unitario (FE) | `src/utils/format.test.js` | Formateo de fechas y montos |
| Unitario (FE) | `Boton.test.jsx` | Render, variantes, click handler |
| Unitario (FE) | `Lista.test.jsx` | Encabezados, filas, búsqueda, paginación, skeleton |
| Unitario (FE) | `TarjetaInfoSimple.test.jsx` | Render de props, click |
| CRUD (BE) | `clienteController.test.js` | Operaciones CRUD del controller con modelos mockeados |
| CRUD (FE) | `Clientes.test.jsx` | Listado, búsqueda, modales de alta y edición |
| Integración (BE) | `clienteIntegracion.test.js` | HTTP → authMiddleware → controller (Supertest) |
| Integración (FE) | `ClientesIntegracion.test.jsx` | Flujo completo alta de cliente con componentes reales |

## Módulos

### Clientes
Alta, modificación y baja lógica de socios. Búsqueda por nombre, apellido, DNI, teléfono o email.

### Inventario
Gestión del catálogo de productos: DVDs, VHS, CDs y vinilos. Control de stock. Los DVDs y VHS pueden alquilarse; CDs y vinilos solo se venden.

### Ventas
Registro de ventas con múltiples productos. Soporte para clientes registrados o consumidor final. Anulación de ventas con reposición automática de stock.

### Alquileres
Registro de alquileres de DVDs y VHS. Cálculo automático del monto según tarifa diaria y fecha de devolución esperada. Registro de devoluciones con detección de retraso y cálculo de recargo.

### Usuarios
Gestión del personal del sistema con roles **admin** y **empleado**. Los admins pueden crear, editar y desactivar usuarios. Cada usuario puede actualizar su foto de perfil y contraseña.

### Reportes
Resumen de ventas e ingresos por período con gráficos. Exportación a PDF. Detección de productos con stock crítico (≤ 2 unidades).

### Dashboard
Vista de inicio con métricas del día: ventas realizadas, alquileres activos, nuevos clientes y alertas de stock crítico.

### Configuración (solo admin)
- **Tarifas de alquiler:** precio por día para DVDs y VHS
- **Métodos de pago:** gestión de medios de pago habilitados

## Roles

| Rol | Permisos |
| --- | --- |
| `admin` | Acceso completo. Puede gestionar usuarios, tarifas y métodos de pago. |
| `empleado` | Puede registrar ventas, alquileres, devoluciones y consultar clientes e inventario. No accede a configuración ni usuarios. |

## Estructura del proyecto

```
videovinyl/
├── backend/
│   ├── src/
│   │   ├── controllers/   # Lógica de negocio por recurso
│   │   ├── middlewares/   # Auth JWT, manejo de errores
│   │   ├── models/        # Modelos Sequelize (Venta, Alquiler, Cliente, etc.)
│   │   ├── routes/        # Definición de endpoints REST
│   │   ├── seeders/       # Script de usuario administrador inicial
│   │   └── utils/         # Funciones de cálculo reutilizables
│   └── vitest.config.js
├── frontend/
│   ├── src/
│   │   ├── api/           # Clientes HTTP por recurso (axios)
│   │   ├── components/    # Componentes reutilizables (Modal, Lista, Tarjetas, etc.)
│   │   ├── context/       # ToastContext
│   │   ├── hooks/         # useDebouncedValue
│   │   ├── pages/         # Una carpeta por vista principal
│   │   ├── styles/        # Variables SCSS y estilos globales
│   │   └── utils/         # Funciones de cálculo y formateo
│   └── vite.config.js
└── docker-compose.yml
```
