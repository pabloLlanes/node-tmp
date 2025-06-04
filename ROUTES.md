# Guu00eda de Rutas (Routes)

## u00bfQuu00e9 son las Rutas?

Las rutas en una aplicaciu00f3n Node.js/Express definen los "endpoints" o URLs a los que la API responde. Son el punto de entrada para todas las solicitudes de los clientes y especifican:

1. **La URL**: La direcciu00f3n que el cliente debe usar para acceder a un recurso
2. **El mu00e9todo HTTP**: GET, POST, PUT, PATCH, DELETE, etc.
3. **Los middlewares**: Funciones que se ejecutan antes del controlador principal
4. **El controlador**: La funciu00f3n que finalmente maneja la solicitud

Las rutas siguen los principios RESTful para proporcionar una interfaz estandarizada y predecible para manipular recursos.

## Estructura de Definicu00f3n de Rutas

En nuestra aplicaciu00f3n, cada archivo de rutas sigue esta estructura:

```javascript
// 1. Importaciones necesarias
import { Router } from 'express';
import { check, param } from 'express-validator';
import { handleValidationErrors } from '../middlewares/validationMiddleware.js';

// 2. Importaciu00f3n de controladores
import { 
  controllerFunction1,
  controllerFunction2 
} from '../controllers/specificController.js';

// 3. Importaciu00f3n de middlewares (si son necesarios)
import { verifyToken } from '../middlewares/verifyToken.js';

// 4. Creaciu00f3n del router
const specificRouter = Router();

// 5. Definicu00f3n de rutas
specificRouter.get('/', controllerFunction1);

specificRouter.post('/', [
  // Middleware de validaciu00f3n
  check('field').notEmpty().withMessage('El campo es obligatorio'),
  handleValidationErrors,
  // Middleware de autenticaciu00f3n (si es necesario)
  verifyToken
], controllerFunction2);

// 6. Exportaciu00f3n del router
export default specificRouter;
```

## Organizaciu00f3n de Rutas

Nuestra API organiza las rutas por recursos, siguiendo las mejores pru00e1cticas RESTful:

### 1. Rutas de Usuarios (`userRouter.js`)

Gestiona las operaciones relacionadas con los usuarios:

```
/api/users/register      POST   - Registrar un nuevo usuario
/api/users/login         POST   - Iniciar sesiu00f3n
/api/users               GET    - Listar usuarios (admin)
/api/users/:id           GET    - Obtener un usuario especu00edfico
/api/users/:id           PUT    - Actualizar un usuario
/api/users/:id           DELETE - Eliminar/desactivar un usuario
```

### 2. Rutas de Productos (`productRouter.js`)

Maneja todas las operaciones sobre productos:

```
/api/products                  GET    - Listar productos (paginado)
/api/products/search           GET    - Buscar productos por texto
/api/products/filter           GET    - Filtrar productos por criterios
/api/products/:id              GET    - Obtener un producto especu00edfico
/api/products                  POST   - Crear un nuevo producto
/api/products/:id              PUT    - Actualizar completamente un producto
/api/products/:id              PATCH  - Actualizar parcialmente un producto
/api/products/:id              DELETE - Eliminar un producto
/api/products/:id/upload-image POST   - Subir imagen para un producto
```

### 3. Rutas de Categoru00edas (`categoryRouter.js`)

Administra las categoru00edas de productos:

```
/api/categories               GET    - Listar todas las categoru00edas
/api/categories/:id           GET    - Obtener una categoru00eda especu00edfica
/api/categories/:id/products  GET    - Obtener productos de una categoru00eda
/api/categories               POST   - Crear una nueva categoru00eda
/api/categories/:id           PUT    - Actualizar completamente una categoru00eda
/api/categories/:id           PATCH  - Actualizar parcialmente una categoru00eda
/api/categories/:id           DELETE - Eliminar una categoru00eda
```

### 4. Rutas de u00d3rdenes (`orderRouter.js`)

Gestiona las u00f3rdenes de compra:

```
/api/orders                   GET    - Listar u00f3rdenes del usuario
/api/orders/:id               GET    - Obtener una orden especu00edfica
/api/orders                   POST   - Crear una nueva orden
/api/orders/:id/status        PATCH  - Actualizar estado de una orden
/api/orders/:id/cancel        POST   - Cancelar una orden
```

### 5. Rutas de Relaciones (`relationRouter.js`)

Maneja las relaciones entre entidades:

```
/api/relations/products/:productId/creator    POST - Asignar creador a producto
/api/relations/products/:productId/category   POST - Asignar categoru00eda a producto
/api/relations/categories/:categoryId/products POST - Asignar productos a categoru00eda
/api/relations/users/:userId/products         GET  - Obtener productos de un usuario
```

## Componentes Clave

### 1. Validaciu00f3n de Entradas

Utilizamos `express-validator` para validar los datos recibidos:

```javascript
// Validaciu00f3n de campos en el body
check('name').notEmpty().withMessage('El nombre es obligatorio'),
check('email').isEmail().withMessage('Email no vu00e1lido'),

// Validaciu00f3n de paru00e1metros en la URL
param('id').isMongoId().withMessage('ID no vu00e1lido'),

// Middleware para procesar errores de validaciu00f3n
handleValidationErrors
```

### 2. Middlewares de Autenticaciu00f3n

Protegemos rutas sensibles mediante middleware de autenticaciu00f3n:

```javascript
// Rutas pu00fablicas vs protegidas
publicRouter.get('/public', publicController);
privateRouter.get('/private', verifyToken, privateController);

// Rutas con restricciones por rol
adminRouter.get('/admin-only', [verifyToken, verifyAdminRole], adminController);
```

### 3. Cadenas de Middlewares

Agrupamos mu00faltiples middlewares para procesar la solicitud secuencialmente:

```javascript
router.post('/', [
  // 1. Validaciu00f3n de datos
  check('field1').notEmpty(),
  check('field2').isNumeric(),
  // 2. Procesar errores de validaciu00f3n
  handleValidationErrors,
  // 3. Verificar autenticaciu00f3n
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

Veamos en detalle cu00f3mo se implementa una ruta compleja como la subida de imu00e1genes:

```javascript
/**
 * Ruta: POST /api/products/:id/upload-image
 * Descripciu00f3n: Subir una imagen para un producto especu00edfico
 * Paru00e1metros de ruta:
 *   - id: ID de MongoDB del producto
 * Body: Formulario multipart/form-data con un campo 'image' que contiene el archivo
 * Middlewares:
 *   - Validaciu00f3n del ID
 *   - Multer para procesar el archivo subido (upload.single)
 * Respuesta: { success, message, product, imageUrl, file }
 */
productRouter.post("/:id/upload-image", [
    // Validar que el ID sea un MongoDB ObjectId vu00e1lido
    param('id').isMongoId().withMessage('ID de producto no vu00e1lido'),
    // Manejo de errores de validaciu00f3n
    handleValidationErrors
], 
    // Middleware de Multer que procesa un u00fanico archivo con el nombre de campo 'image'
    upload.single('image'), 
    // Controlador que maneja la lu00f3gica despuu00e9s de que el archivo ha sido procesado
    uploadProductImage
);
```

Este ejemplo muestra:

1. **Documentaciu00f3n detallada**: Describe el propu00f3sito, paru00e1metros y respuesta esperada
2. **Validaciu00f3n de URL**: Asegura que el ID sea un MongoDB ObjectId vu00e1lido
3. **Procesamiento de archivos**: Usa el middleware `upload.single('image')` para manejar la carga
4. **Controlador especu00edfico**: La funciu00f3n `uploadProductImage` maneja la lu00f3gica final

## Patrones RESTful Implementados

Nuestras rutas siguen los patrones RESTful estu00e1ndar:

| Mu00e9todo HTTP | URL                      | Acciu00f3n                           |
|------------|--------------------------|-----------------------------------|
| GET        | /api/resource            | Listar recursos (Leer varios)     |
| GET        | /api/resource/:id        | Obtener un recurso (Leer uno)     |
| POST       | /api/resource            | Crear un nuevo recurso            |
| PUT        | /api/resource/:id        | Actualizar todo un recurso        |
| PATCH      | /api/resource/:id        | Actualizar parte de un recurso    |
| DELETE     | /api/resource/:id        | Eliminar un recurso               |

Además, implementamos operaciones especiales mediante URLs y métodos apropiados:

| Mu00e9todo HTTP | URL                       | Acciu00f3n                            |
|------------|---------------------------|------------------------------------|
| GET        | /api/resource/search      | Buscar recursos                    |
| POST       | /api/resource/:id/action  | Realizar una acciu00f3n sobre un recurso |
| GET        | /api/parent/:id/children  | Obtener recursos relacionados      |

## Registro de Rutas en la Aplicaciu00f3n

Todas las rutas se registran en el archivo principal `app.js`:

```javascript
// Importaciones de routers
import userRouter from "./routes/userRouter.js";
import productRouter from "./routes/productRouter.js";
import categoryRouter from "./routes/categoryRouter.js";
import orderRouter from "./routes/orderRouter.js";
import relationRouter from "./routes/relationRouter.js";

// Registro de rutas con prefijos
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/orders", orderRouter);
app.use("/api/relations", relationRouter);
```

Esto permite:

1. **Organizaciu00f3n modular**: Cada conjunto de rutas estu00e1 en su propio archivo
2. **Prefijos de URL**: Todas las rutas comparten un prefijo comu00fan (/api/resource)
3. **Mantenibilidad**: Fu00e1cil au00f1adir, modificar o eliminar conjuntos enteros de rutas

## Mejores Pru00e1cticas Implementadas

1. **Nombres significativos**: Las URLs reflejan los recursos que representan

2. **Consistencia**: Estructura similar en todos los archivos de rutas

3. **Versiones de API**: Todas las rutas tienen el prefijo `/api` (potencialmente expandible a `/api/v1`)

4. **Documentaciu00f3n exhaustiva**: Cada ruta incluye comentarios detallados

5. **Validaciu00f3n preventiva**: Validamos datos antes de llegar a los controladores

6. **Seguridad**: Protegemos rutas sensibles con middleware de autenticaciu00f3n

7. **Modularidad**: Cada recurso tiene su propio router independiente

## Conclusiu00f3n

Las rutas son la interfaz pu00fablica de nuestra API. Siguen los principios RESTful, implementan validaciu00f3n robusta y manejan adecuadamente la autenticaciu00f3n y autorizaciu00f3n. Su organizaciu00f3n modular facilita el mantenimiento y la escalabilidad de la aplicaciu00f3n.
