# Guía de Rutas (Routes)

## ¿Qué son las Rutas?

Las rutas en una aplicación Node.js/Express definen los "endpoints" o URLs a los que la API responde. Son el punto de entrada para todas las solicitudes de los clientes y especifican:

1. **La URL**: La dirección que el cliente debe usar para acceder a un recurso
2. **El método HTTP**: GET, POST, PUT, PATCH, DELETE, etc.
3. **Los middlewares**: Funciones que se ejecutan antes del controlador principal
4. **El controlador**: La función que finalmente maneja la solicitud

Las rutas siguen los principios RESTful para proporcionar una interfaz estandarizada y predecible para manipular recursos.

## Estructura de Definición de Rutas

En nuestra aplicación, cada archivo de rutas sigue esta estructura:

```javascript
// 1. Importaciones necesarias
import { Router } from 'express';
import { check, param } from 'express-validator';
import { handleValidationErrors } from '../middlewares/validationMiddleware.js';

// 2. Importación de controladores
import { 
  controllerFunction1,
  controllerFunction2 
} from '../controllers/specificController.js';

// 3. Importación de middlewares (si son necesarios)
import { verifyToken } from '../middlewares/verifyToken.js';

// 4. Creación del router
const specificRouter = Router();

// 5. Definición de rutas
specificRouter.get('/', controllerFunction1);

specificRouter.post('/', [
  // Middleware de validación
  check('field').notEmpty().withMessage('El campo es obligatorio'),
  handleValidationErrors,
  // Middleware de autenticación (si es necesario)
  verifyToken
], controllerFunction2);

// 6. Exportación del router
export default specificRouter;
```

## Organización de Rutas

Nuestra API organiza las rutas por recursos, siguiendo las mejores prácticas RESTful:

### 1. Rutas de Autenticación (`authRouter.js`)

Gestiona las operaciones relacionadas con la autenticación:

```
/api/auth/register      POST   - Registrar un nuevo usuario (sin token)
/api/auth/login         POST   - Iniciar sesión y obtener token
```

### 2. Rutas de Usuarios (`userRouter.js`)

Gestiona las operaciones relacionadas con los usuarios:

```
/api/users               GET    - Listar usuarios (admin)
/api/users/:id           GET    - Obtener un usuario específico
/api/users               POST   - Crear un usuario (solo admin)
/api/users/:id           PUT    - Actualizar un usuario
/api/users/:id           DELETE - Eliminar/desactivar un usuario
```

### 3. Rutas de Productos (`productRouter.js`)

Maneja todas las operaciones sobre productos:

```
/api/products                  GET    - Listar productos (paginado)
/api/products/search           GET    - Buscar productos por texto
/api/products/filter           GET    - Filtrar productos por criterios
/api/products/:id              GET    - Obtener un producto específico
/api/products                  POST   - Crear un nuevo producto
/api/products/:id              PUT    - Actualizar completamente un producto
/api/products/:id              PATCH  - Actualizar parcialmente un producto
/api/products/:id              DELETE - Eliminar un producto
/api/products/:id/upload-image POST   - Subir imagen para un producto
```

### 4. Rutas de Categorías (`categoryRouter.js`)

Administra las categorías de productos:

```
/api/categories               GET    - Listar todas las categorías
/api/categories/:id           GET    - Obtener una categoría específica
/api/categories/:id/products  GET    - Obtener productos de una categoría
/api/categories               POST   - Crear una nueva categoría
/api/categories/:id           PUT    - Actualizar completamente una categoría
/api/categories/:id           PATCH  - Actualizar parcialmente una categoría
/api/categories/:id           DELETE - Eliminar una categoría
```

### 5. Rutas de Órdenes (`orderRouter.js`)

Gestiona las órdenes de compra:

```
/api/orders                   GET    - Listar órdenes del usuario
/api/orders/:id               GET    - Obtener una orden específica
/api/orders                   POST   - Crear una nueva orden
/api/orders/:id/status        PATCH  - Actualizar estado de una orden
/api/orders/:id/cancel        POST   - Cancelar una orden
```

### 6. Rutas de Relaciones (`relationRouter.js`)

Maneja las relaciones entre entidades:

```
/api/relations/products/:productId/creator    POST - Asignar creador a producto
/api/relations/products/:productId/category   POST - Asignar categoría a producto
/api/relations/categories/:categoryId/products POST - Asignar productos a categoría
/api/relations/users/:userId/products         GET  - Obtener productos de un usuario
```

## Componentes Clave

### 1. Validación de Entradas

Utilizamos `express-validator` para validar los datos recibidos:

```javascript
// Validación de campos en el body
check('name').notEmpty().withMessage('El nombre es obligatorio'),
check('email').isEmail().withMessage('Email no válido'),

// Validación de parámetros en la URL
param('id').isMongoId().withMessage('ID no válido'),

// Middleware para procesar errores de validación
handleValidationErrors
```

### 2. Middlewares de Autenticación

Protegemos rutas sensibles mediante middleware de autenticación:

```javascript
// Rutas públicas vs protegidas
publicRouter.get('/public', publicController);
privateRouter.get('/private', verifyToken, privateController);

// Rutas con restricciones por rol
adminRouter.get('/admin-only', [verifyToken, verifyAdminRole], adminController);
```

### 3. Cadenas de Middlewares

Agrupamos múltiples middlewares para procesar la solicitud secuencialmente:

```javascript
router.post('/', [
  // 1. Validación de datos
  check('field1').notEmpty(),
  check('field2').isNumeric(),
  // 2. Procesar errores de validación
  handleValidationErrors,
  // 3. Verificar autenticación
  verifyToken,
  // 4. Verificar permisos
  verifyAdminRole,
  // 5. Procesamiento de archivos (si es necesario)
  upload.single('file'),
  // 6. Controlador principal
  mainController
]);
```

## Ejemplo Detallado: Ruta de Subida de Imagen

Veamos en detalle cómo se implementa una ruta compleja como la subida de imágenes:

```javascript
/**
 * Ruta: POST /api/products/:id/upload-image
 * Descripción: Subir una imagen para un producto específico
 * Parámetros de ruta:
 *   - id: ID de MongoDB del producto
 * Body: Formulario multipart/form-data con un campo 'image' que contiene el archivo
 * Middlewares:
 *   - Validación del ID
 *   - Multer para procesar el archivo subido (upload.single)
 * Respuesta: { success, message, product, imageUrl, file }
 */
productRouter.post("/:id/upload-image", [
    // Validar que el ID sea un MongoDB ObjectId válido
    param('id').isMongoId().withMessage('ID de producto no válido'),
    // Manejo de errores de validación
    handleValidationErrors
], 
    // Middleware de Multer que procesa un único archivo con el nombre de campo 'image'
    upload.single('image'), 
    // Controlador que maneja la lógica después de que el archivo ha sido procesado
    uploadProductImage
);
```

Este ejemplo muestra:

1. **Documentación detallada**: Describe el propósito, parámetros y respuesta esperada
2. **Validación de URL**: Asegura que el ID sea un MongoDB ObjectId válido
3. **Procesamiento de archivos**: Usa el middleware `upload.single('image')` para manejar la carga
4. **Controlador específico**: La función `uploadProductImage` maneja la lógica final

## Patrones RESTful Implementados

Nuestras rutas siguen los patrones RESTful estándar:

| Método HTTP | URL                      | Acción                           |
|------------|--------------------------|-----------------------------------|
| GET        | /api/resource            | Listar recursos (Leer varios)     |
| GET        | /api/resource/:id        | Obtener un recurso (Leer uno)     |
| POST       | /api/resource            | Crear un nuevo recurso            |
| PUT        | /api/resource/:id        | Actualizar todo un recurso        |
| PATCH      | /api/resource/:id        | Actualizar parte de un recurso    |
| DELETE     | /api/resource/:id        | Eliminar un recurso               |

Además, implementamos operaciones especiales mediante URLs y métodos apropiados:

| Método HTTP | URL                       | Acción                            |
|------------|---------------------------|------------------------------------|
| GET        | /api/resource/search      | Buscar recursos                    |
| POST       | /api/resource/:id/action  | Realizar una acción sobre un recurso |
| GET        | /api/parent/:id/children  | Obtener recursos relacionados      |

## Registro de Rutas en la Aplicación

Todas las rutas se registran en el archivo principal `app.js`:

```javascript
// Importaciones de routers
import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRouter.js";
import productRouter from "./routes/productRouter.js";
import categoryRouter from "./routes/categoryRouter.js";
import orderRouter from "./routes/orderRouter.js";
import relationRouter from "./routes/relationRouter.js";

// Registro de rutas con prefijos
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/orders", orderRouter);
app.use("/api/relations", relationRouter);
```

Esto permite:

1. **Organización modular**: Cada conjunto de rutas está en su propio archivo
2. **Prefijos de URL**: Todas las rutas comparten un prefijo común (/api/resource)
3. **Mantenibilidad**: Fácil añadir, modificar o eliminar conjuntos enteros de rutas

## Mejores Prácticas Implementadas

1. **Nombres significativos**: Las URLs reflejan los recursos que representan

2. **Consistencia**: Estructura similar en todos los archivos de rutas

3. **Versiones de API**: Todas las rutas tienen el prefijo `/api` (potencialmente expandible a `/api/v1`)

4. **Documentación exhaustiva**: Cada ruta incluye comentarios detallados

5. **Validación preventiva**: Validamos datos antes de llegar a los controladores

6. **Seguridad**: Protegemos rutas sensibles con middleware de autenticación

7. **Modularidad**: Cada recurso tiene su propio router independiente

## Conclusión

Las rutas son la interfaz pública de nuestra API. Siguen los principios RESTful, implementan validación robusta y manejan adecuadamente la autenticación y autorización. Su organización modular facilita el mantenimiento y la escalabilidad de la aplicación.
