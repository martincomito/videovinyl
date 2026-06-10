# VideoVinyl

Sistema de gestión para VideoVinyl, un videoclub que vende y alquila productos. Permite administrar clientes, stock, ventas y alquileres desde una interfaz web.

## Tecnologías

- **Frontend:** React 19 + Vite
- **Backend:** Node.js + Express 5
- **Base de datos:** PostgreSQL 15 + Sequelize
- **Infraestructura:** Docker + Docker Compose

## Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado (incluye Docker Compose)

## Configuración inicial (desarrollo local)

1. Clonar el repositorio:

   ```bash
   git clone <url-del-repositorio>
   cd videovinyl
   ```

2. Crear el archivo de variables de entorno y completar los valores:

   ```bash
   cp .env.example .env
   ```

   Variables a completar en `.env`:

   | Variable         | Descripción                                              |
   | ---------------- | -------------------------------------------------------- |
   | `JWT_SECRET`     | Cadena larga y aleatoria usada para firmar los tokens    |
   | `ADMIN_EMAIL`    | Email del usuario administrador inicial                  |
   | `ADMIN_PASSWORD` | Contraseña del usuario administrador inicial             |

3. Levantar todos los servicios:

   ```bash
   docker compose up -d --build
   ```

4. Crear el usuario administrador inicial:

   ```bash
   docker exec videovinyl_backend node src/seeders/adminSeed.js
   ```

   Este comando solo necesita correrse una vez. Si se vuelve a correr, actualiza el usuario existente sin crear duplicados.

5. Acceder al sistema en [http://localhost:5173](http://localhost:5173) con las credenciales definidas en el `.env`.

## Accesos

| Servicio      | URL                   |
| ------------- | --------------------- |
| Frontend      | http://localhost:5173 |
| Backend (API) | http://localhost:3000 |
| Base de datos | localhost:5432        |

## Modificar variables de entorno

Cada vez que se modifique el `.env`, el container del backend debe recrearse para que los cambios tomen efecto (un simple `restart` no alcanza):

```bash
docker compose up -d --force-recreate backend
```

## Módulos

- **Clientes** — alta, baja, modificación y consulta de clientes
- **Stock** — gestión de productos disponibles
- **Ventas** — registro de ventas
- **Alquileres** — registro de alquileres
