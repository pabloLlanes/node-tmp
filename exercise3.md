# Ejercicio 3: Filtrado de Productos por Precio y Disponibilidad

Este ejercicio explica paso a paso cómo filtrar productos por precio y disponibilidad usando la API RESTful del proyecto Node.js.

## Objetivo

Entender cómo funciona el filtrado de productos, qué parámetros acepta y cómo interpretar los resultados.

## Requisitos Previos

- Tener el servidor Node.js ejecutándose (npm run dev)
- Un cliente HTTP como Postman, Insomnia o Thunder Client
- Tener productos con diferentes precios y estados de disponibilidad en la base de datos

## Pasos para Filtrar Productos

### 1. Preparar la Petición

Para filtrar productos, utilizaremos una solicitud GET a la siguiente ruta:

```
GET http://localhost:3000/api/products/filter
```

### 2. Parámetros de Filtrado

La ruta acepta los siguientes parámetros como query strings:

- `minPrice`: Precio mínimo (opcional)
- `maxPrice`: Precio máximo (opcional)
- `isAvailable`: Disponibilidad del producto (true/false, opcional)
- `page`: Número de página para la paginación (opcional, default: 1)
- `limit`: Cantidad de resultados por página (opcional, default: 10)

Ejemplos:

```
/api/products/filter?minPrice=500&maxPrice=1000       // Productos entre $500 y $1000
/api/products/filter?isAvailable=true                 // Solo productos disponibles
/api/products/filter?minPrice=800&isAvailable=true    // Productos disponibles con precio mínimo $800
```

### 3. Enviar la Petición

Una vez que tenemos la URL con los parámetros apropiados, enviamos la solicitud GET.

### 4. Analizar la Respuesta

Si el filtrado es exitoso, recibiremos una respuesta con código de estado **200** con el siguiente formato:

```json
{
  "success": true,
  "count": 3,                   // Cantidad de productos en esta página
  "total": 5,                   // Total de productos que coinciden con el filtro
  "totalPages": 2,              // Total de páginas disponibles
  "currentPage": 1,             // Página actual
  "products": [                 // Array de productos filtrados
    {
      "_id": "65a23f48b731c123456789ab",
      "name": "Laptop Lenovo ThinkPad",
      "price": 899.99,
      "description": "Laptop profesional con procesador Intel Core i7...",
      "category": "6463d6e2e88aed4b23b3a268",
      "available": true,
      "stock": 15,
      "image": "/images/laptop-thinkpad.jpg",
      "createdAt": "2023-01-12T21:23:20.221Z",
      "updatedAt": "2023-01-12T21:23:20.221Z"
    },
    // ... más productos
  ]
}
```

### 5. Manejo de Errores

Si ocurre algún error durante el filtrado, recibiremos una respuesta con código de estado apropiado y un mensaje de error:

```json
{
  "success": false,
  "message": "Error al filtrar productos",
  "error": "Detalles del error"
}
```

## Detalle de la Implementación

El controlador `filterProducts` en `productController.js` maneja esta operación:

```javascript
export const filterProducts = async (req, res) => {
  try {
    // Parámetros de paginación
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Parámetros de filtrado
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined;
    const isAvailable = req.query.isAvailable ? req.query.isAvailable === 'true' : undefined;
    
    // Construir el filtro basado en parámetros proporcionados
    const filter = {};
    
    // Filtro por rango de precio
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) {
        filter.price.$gte = minPrice;  // Mayor o igual que el precio mínimo
      }
      if (maxPrice !== undefined) {
        filter.price.$lte = maxPrice;  // Menor o igual que el precio máximo
      }
    }
    
    // Filtro por disponibilidad
    if (isAvailable !== undefined) {
      filter.available = isAvailable;
    }
    
    // Ejecutar consulta con filtros y paginación
    const products = await Product.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
      
    // Contar total de resultados para la paginación
    const total = await Product.countDocuments(filter);
    
    // Enviar respuesta con resultados y metadatos de paginación
    res.json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      products,
      filters: {  // Incluir los filtros aplicados para referencia
        minPrice,
        maxPrice,
        isAvailable
      }
    });
    
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Error al filtrar productos',
      error: error.message
    });
  }
};
```

## ¿Cómo Funciona el Filtrado?

1. El controlador extrae los parámetros de filtrado y paginación de la URL
2. Construye dinámicamente un objeto de filtro basado en los parámetros proporcionados
3. Para el rango de precios, usa los operadores de MongoDB:
   - `$gte`: Mayor o igual que (Greater Than or Equal)
   - `$lte`: Menor o igual que (Less Than or Equal)
4. Aplica el filtro a la consulta MongoDB junto con la paginación
5. Devuelve los resultados y metadatos de paginación

## MongoDB: Operadores de Consulta

El filtrado utiliza varios operadores de MongoDB para construir consultas complejas:

```javascript
// Ejemplo de filtro por rango de precio
{ price: { $gte: 500, $lte: 1000 } }  // Precio entre 500 y 1000

// Ejemplo de filtro por disponibilidad
{ available: true }  // Solo productos disponibles

// Ejemplo de filtros combinados
{ 
  price: { $gte: 500 },  // Precio mínimo 500
  available: true        // Solo disponibles
}
```

## Ejercicio Práctico

1. Filtra productos con precio entre $500 y $1000
2. Filtra productos que estén disponibles (isAvailable=true)
3. Combina filtros: Productos disponibles con precio mínimo de $800
4. Practica la paginación en los resultados filtrados
5. Verifica qué sucede cuando no hay productos que coincidan con los filtros

## Diagramas de Secuencia

```
Cliente                           Servidor                      Base de Datos
  |                                  |                               |
  | --- GET /products/filter?... --> |                               |
  |                                  | --- Construir filtros ----    |
  |                                  | --- Consulta con filtros -->  |
  |                                  | <-- Resultados ------------- |
  |                                  | --- Consulta count -------->  |
  |                                  | <-- Total ----------------- |
  | <-- Respuesta JSON con datos --- |                               |
```

## Conclusión

Este ejercicio mostró cómo usar el endpoint de filtrado de productos por precio y disponibilidad. Esta funcionalidad permite a los usuarios refinar sus búsquedas según criterios específicos, lo que mejora significativamente la experiencia de usuario al navegar por un catálogo de productos. La capacidad de combinar diferentes filtros y aplicar paginación hace que esta API sea flexible y potente.
