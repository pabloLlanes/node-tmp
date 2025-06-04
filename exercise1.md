# Ejercicio 1: Creación de Productos

Este ejercicio explica paso a paso cómo crear productos utilizando la API RESTful del proyecto Node.js.

## Objetivo

Entender el flujo completo de creación de un producto, desde la estructura de la petición hasta la recepción de la respuesta.

## Requisitos Previos

- Tener el servidor Node.js ejecutándose (npm run dev)
- Un cliente HTTP como Postman, Insomnia o Thunder Client

## Pasos para Crear un Producto

### 1. Preparar la Petición

Para crear un producto, necesitamos realizar una solicitud POST a la siguiente ruta:

```
POST http://localhost:3000/api/products
```

### 2. Configurar el Encabezado (Header)

Configuramos el encabezado para indicar que estamos enviando datos en formato JSON:

```
Content-Type: application/json
```

### 3. Preparar el Cuerpo de la Petición (Body)

El cuerpo de la petición debe contener los datos del producto en formato JSON. A continuación se muestra un ejemplo:

```json
{
  "name": "Laptop Lenovo ThinkPad",
  "price": 1299.99,
  "description": "Laptop profesional con procesador Intel Core i7, 16GB RAM y 512GB SSD",
  "category": "6463d6e2e88aed4b23b3a268", // ID de categoría (ejemplo)
  "available": true,
  "stock": 15,
  "image": "/images/laptop-thinkpad.jpg" // Opcional
}
```

**Campos Obligatorios:**
- `name`: Nombre del producto (obligatorio)

**Campos Opcionales:**
- `price`: Precio del producto
- `description`: Descripción detallada
- `category`: ID de la categoría (debe ser un ObjectId válido de MongoDB)
- `available`: Disponibilidad del producto (booleano)
- `stock`: Cantidad disponible
- `image`: URL de la imagen (opcional)

### 4. Enviar la Petición

Una vez que tenemos configurada nuestra petición, la enviamos al servidor.

### 5. Analizar la Respuesta

Si la creación del producto es exitosa, recibiremos una respuesta con código de estado **200** con el siguiente formato:

```json
{
  "success": true,
  "product": {
    "_id": "65a23f48b731c123456789ab", // ID generado automáticamente
    "name": "Laptop Lenovo ThinkPad",
    "price": 1299.99,
    "description": "Laptop profesional con procesador Intel Core i7, 16GB RAM y 512GB SSD",
    "category": "6463d6e2e88aed4b23b3a268",
    "available": true,
    "stock": 15,
    "image": "/images/laptop-thinkpad.jpg",
    "creator": "65a1d8e9cde123456789cd", // ID del usuario creador (si está autenticado)
    "createdAt": "2023-01-12T21:23:20.221Z",
    "updatedAt": "2023-01-12T21:23:20.221Z",
    "__v": 0
  }
}
```

### 6. Manejo de Errores

Si ocurre algún error durante la creación, recibiremos una respuesta con código de estado apropiado (400, 500, etc.) y un mensaje de error:

```json
{
  "success": false,
  "message": "Error al crear el producto",
  "error": "Detalles del error"
}
```

**Posibles errores:**
- **400**: Datos de entrada inválidos (por ejemplo, nombre vacío)
- **500**: Error del servidor

## Código del Controlador

El controlador `createProduct` en `productController.js` maneja esta operación:

```javascript
export const createProduct = async (req, res) => {
  try {
    // Extraer datos del body de la petición
    const productData = req.body;
    
    // Agregar el usuario creador si está autenticado
    if (req.user) {
      productData.creator = req.user._id;
    }
    
    // Crear el producto en la base de datos
    const newProduct = await Product.create(productData);
    
    // Responder con el producto creado
    res.json({
      success: true,
      product: newProduct
    });
    
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el producto',
      error: error.message
    });
  }
}
```

## Flujo de Validación

1. **Express Validator** valida que el campo `name` no esté vacío
2. **Middleware de validación** verifica si hubo errores y responde apropiadamente
3. **Controlador** procesa la petición y crea el producto
4. **Mongoose** guarda el producto en MongoDB

## Ejercicio Práctico

1. Crea un nuevo producto con los datos mínimos requeridos (solo name)
2. Crea un producto con todos los campos disponibles
3. Intenta crear un producto sin nombre y observa la respuesta de error
4. Verifica que los productos creados aparecen al listar todos los productos (GET /api/products)

## Diagramas de Secuencia

```
Cliente                    Servidor                     Base de Datos
  |                           |                             |
  | --- POST /api/products -->|                             |
  |                           | --- Validar datos ------->  |
  |                           | --- Crear Producto ------>  |
  |                           |                             |
  | <-- Respuesta JSON ------ |                             |
```

## Conclusión

Este ejercicio mostró cómo crear productos mediante la API RESTful. El proceso implica enviar una solicitud HTTP POST con datos en formato JSON y recibir una respuesta que confirma la creación exitosa o informa sobre errores.
