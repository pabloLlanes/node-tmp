# API de E-Commerce Node.js

Esta es una API RESTful completa para una plataforma de e-commerce, desarrollada con Node.js, Express y MongoDB. La aplicación sigue una arquitectura MVC y proporciona funcionalidades para la gestión de usuarios, productos, categorías y órdenes.

## Tabla de Contenidos

- [Estructura del Proyecto](#estructura-del-proyecto)
- [Modelos y Relaciones](#modelos-y-relaciones)
- [Instalación y Configuración](#instalación-y-configuración)
- [Endpoints de la API](#endpoints-de-la-api)
- [Funcionalidades Principales](#funcionalidades-principales)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)

## Estructura del Proyecto

El proyecto sigue una arquitectura MVC (Model-View-Controller) con la siguiente estructura de directorios:

```
node-web8/
├── src/
│   ├── app.js             # Punto de entrada de la aplicación
│   ├── config/            # Configuraciones (DB, entorno, etc.)
│   ├── controllers/       # Controladores para manejar la lógica de negocio
│   ├── middlewares/       # Middlewares personalizados
│   ├── models/            # Modelos de datos (Mongoose)
│   └── routes/            # Definición de rutas de la API
├── uploads/               # Directorio para archivos subidos
├── package.json           # Dependencias y scripts
└── README.md              # Este archivo
```

## Modelos y Relaciones

La aplicación utiliza Mongoose como ODM (Object Document Mapper) para interactuar con MongoDB. A continuación se detallan los modelos principales y sus relaciones:

### Modelo de Usuario (`User`)

Almacena información de los usuarios registrados en la plataforma.

**Campos principales:**
- `name`: Nombre del usuario
- `email`: Email único del usuario
- `password`: Contraseña (almacenada de forma segura)
- `role`: Rol del usuario (`USER_ROLE` o `ADMIN_ROLE`)
- `isActive`: Estado de activación de la cuenta
- `defaultShippingAddress`: Dirección de envío por defecto

**Relaciones:**
- **Órdenes**: Un usuario puede tener múltiples órdenes (relación uno a muchos)
  - Implementado mediante un campo virtual `orders` que referencia al modelo `Order`

### Modelo de Producto (`Product`)

Define los productos disponibles en la plataforma.

**Campos principales:**
- `name`: Nombre del producto
- `description`: Descripción detallada
- `stock`: Cantidad disponible
- `isAvailable`: Indica si el producto está disponible
- `price`: Precio del producto
- `image`: Ruta a la imagen del producto

**Relaciones:**
- **Categoría**: Un producto pertenece a una categoría (relación muchos a uno)
  - Implementado mediante el campo `category` que referencia al modelo `Category`
- **Creador**: Un producto tiene un creador/administrador (relación muchos a uno)
  - Implementado mediante el campo `creator` que referencia al modelo `User`

### Modelo de Categoría (`Category`)

Clasificación para agrupar productos similares.

**Campos principales:**
- `name`: Nombre único de la categoría
- `description`: Descripción de la categoría
- `isActive`: Estado de activación

**Relaciones:**
- **Creador**: Una categoría tiene un creador/administrador (relación muchos a uno)
  - Implementado mediante el campo `creator` que referencia al modelo `User`
- **Productos**: Una categoría puede contener múltiples productos (relación uno a muchos)
  - Esta relación se implementa desde el modelo `Product`

### Modelo de Orden (`Order`)

Registra las compras realizadas por los usuarios.

**Campos principales:**
- `items`: Array de productos incluidos en la orden (subschema `orderItemSchema`)
- `shippingAddress`: Dirección de envío
- `paymentInfo`: Información sobre el método de pago
- `totalItems`: Cantidad total de items
- `totalPrice`: Precio total de la orden
- `status`: Estado de la orden (`pending`, `processing`, `shipped`, `delivered`, `cancelled`)

**Relaciones:**
- **Usuario**: Una orden pertenece a un usuario (relación muchos a uno)
  - Implementado mediante el campo `user` que referencia al modelo `User`
- **Productos**: Una orden contiene múltiples productos (relación muchos a muchos)
  - Implementado mediante el subschema `orderItemSchema` que contiene:
    - `product`: Referencia al modelo `Product`
    - `quantity`: Cantidad de unidades
    - `price`: Precio al momento de la compra

### Diagrama de Relaciones

```
+-------------+       +---------------+       +--------------+
|    User     |<----->|     Order     |------>|   Product    |
+-------------+       +---------------+       +--------------+
      ^                      |                      ^
      |                      |                      |
      |                      v                      |
      +----------------+  Product  <----------------+
                       |   Item   |
                       +----------+
                             |
                             v
                       +--------------+
                       |   Category   |
                       +--------------+
```

## Instalación y Configuración

### Prerrequisitos

- Node.js (v14.x o superior)
- MongoDB (v4.x o superior)
- npm o yarn

### Pasos de instalación

1. Clonar el repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd node-web8
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=tu_clave_secreta_para_jwt
   ```

4. Iniciar el servidor:
   ```bash
   npm run dev    # Para desarrollo con nodemon
   npm start      # Para producción
   ```

## Endpoints de la API

La API sigue los principios RESTful y devuelve respuestas en formato JSON.

### Usuarios

- `GET /api/users`: Obtener listado de usuarios (paginado)
- `GET /api/users/:id`: Obtener detalles de un usuario
- `POST /api/users`: Crear un nuevo usuario
- `PUT /api/users/:id`: Actualizar un usuario existente
- `DELETE /api/users/:id`: Desactivar un usuario

### Productos

- `GET /api/products`: Obtener listado de productos (paginado)
- `GET /api/products/:id`: Obtener detalles de un producto
- `POST /api/products`: Crear un nuevo producto
- `PUT /api/products/:id`: Actualizar un producto existente
- `DELETE /api/products/:id`: Eliminar un producto
- `GET /api/products/search`: Búsqueda avanzada de productos

### Categorías

- `GET /api/categories`: Obtener listado de categorías
- `GET /api/categories/:id`: Obtener detalles de una categoría
- `POST /api/categories`: Crear una nueva categoría
- `PUT /api/categories/:id`: Actualizar una categoría existente
- `DELETE /api/categories/:id`: Desactivar una categoría

### Órdenes

- `GET /api/orders`: Obtener listado de órdenes del usuario
- `GET /api/orders/:id`: Obtener detalles de una orden
- `POST /api/orders`: Crear una nueva orden
- `PUT /api/orders/:id`: Actualizar el estado de una orden

## Funcionalidades Principales

### Sistema de Autenticación

- Registro y login de usuarios
- Autenticación basada en JWT (JSON Web Tokens)
- Control de acceso basado en roles (usuario/administrador)

### Gestión de Productos

- CRUD completo de productos
- Búsqueda avanzada por texto
- Filtrado por categoría
- Paginación de resultados
- Control de permisos (solo el creador o administrador puede modificar)

### Gestión de Órdenes

- Creación de órdenes con múltiples productos
- Cálculo automático de totales
- Seguimiento del estado de la orden y pago
- Historial de órdenes por usuario

## Tecnologías Utilizadas

- **Node.js**: Entorno de ejecución
- **Express**: Framework web
- **MongoDB**: Base de datos NoSQL
- **Mongoose**: ODM para MongoDB
- **JWT**: Autenticación basada en tokens
- **Bcrypt**: Encriptación de contraseñas
- **Multer**: Gestión de subida de archivos

## Consideraciones de Seguridad

- Contraseñas almacenadas utilizando hashing con bcrypt
- Validación de datos en cada endpoint
- Protección contra inyecciones NoSQL
- CORS configurado para restringir accesos
- Verificación de permisos para operaciones sensibles

## Características para Desarrollo

- Estructura modular y escalable
- Patrones MVC bien definidos
- Respuestas estandarizadas con formatos consistentes
- Manejo centralizado de errores

---

© 2025 Node E-commerce API. Todos los derechos reservados.
