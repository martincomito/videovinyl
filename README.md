# VideoVinyl

Sistema de gestión para VideoVinyl, un videoclub que vende y alquila productos. Permite administrar clientes, stock, ventas y alquileres desde una interfaz web.

## Tecnologías

- **Frontend:** React 19 + Vite
- **Backend:** Node.js + Express 5
- **Base de datos:** PostgreSQL 15 + Sequelize
- **Infraestructura:** Docker + Docker Compose

## Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado (incluye Docker Compose)

## Levantar el proyecto

1. Clonar el repositorio:

   ```bash
   git clone <url-del-repositorio>
   cd videovinyl
   ```

2. Crear el archivo de variables de entorno:

   ```bash
   cp .env.example .env
   ```

3. Levantar todos los servicios:
   ```bash
   docker-compose up --build
   ```

## Accesos

| Servicio      | URL                   |
| ------------- | --------------------- |
| Frontend      | http://localhost:5173 |
| Backend (API) | http://localhost:3000 |
| Base de datos | localhost:5432        |

## Módulos

- **Clientes** — alta, baja, modificación y consulta de clientes
- **Stock** — gestión de productos disponibles
- **Ventas** — registro de ventas
- **Alquileres** — registro de alquileres
