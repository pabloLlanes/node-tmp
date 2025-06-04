# Ejercicio 2: Búsqueda de Productos por Texto

Este ejercicio explica paso a paso cómo utilizar el endpoint de búsqueda de productos por texto en la API RESTful del proyecto Node.js.

## Objetivo

Entender cómo funciona la búsqueda de productos por texto, qué parámetros acepta y cómo interpretar los resultados.

## Requisitos Previos

- Tener el servidor Node.js ejecutándose (npm run dev)
- Un cliente HTTP como Postman, Insomnia o Thunder Client
- Tener productos creados en la base de datos

## Pasos para Buscar Productos por Texto

### 1. Preparar la Petición

Para buscar productos, utilizaremos una solicitud GET a la siguiente ruta:

```
GET http://localhost:3000/api/products/search?search=texto_a_buscar
```

### 2. Parámetros de Búsqueda

La ruta acepta los siguientes parámetros como query strings:

- `search`: Texto a buscar (obligatorio)
- `page`: Número de página para la paginación (opcional, default: 1)
- `limit`: Cantidad de resultados por página (opcional, default: 10)

Ejemplos:

```
/api/products/search?search=laptop           // Busca productos que contengan "laptop"
/api/products/search?search=laptop&page=2    // Segunda página de resultados
/api/products/search?search=laptop&limit=5   // Limita a 5 resultados por página
```

### 3. Enviar la Petición

Una vez que tenemos la URL con los parámetros apropiados, enviamos la solicitud GET.

### 4. Analizar la Respuesta

Si la búsqueda es exitosa, recibiremos una respuesta con código de estado **200** con el siguiente formato:

```json
{
  "success": true,
  "count": 2,                   // Cantidad de productos encontrados en esta página
  "total": 7,                   // Total de productos que coinciden con la búsqueda
  "totalPages": 4,              // Total de páginas disponibles
  "currentPage": 1,             // Página actual
  "products": [                 // Array de productos encontrados
    {
      "_id": "65a23f48b731c123456789ab",
      "name": "Laptop Lenovo ThinkPad",
      "price": 1299.99,
      "description": "Laptop profesional con procesador Intel Core i7...",
      "category": "6463d6e2e88aed4b23b3a268",
      "available": true,
      "stock": 15,
      "image": "/images/laptop-thinkpad.jpg",
      "creator": "65a1d8e9cde123456789cd",
      "createdAt": "2023-01-12T21:23:20.221Z",
      "updatedAt": "2023-01-12T21:23:20.221Z"
    },
    {
      "_id": "65a24012b731c123456789ac",
      "name": "Laptop HP Pavilion",
      "price": 899.99,
      "description": "Laptop para uso general con procesador AMD...",
      // ... resto de campos
    }
  ]
}
```

### 5. Manejo de Errores

Si ocurre algún error durante la búsqueda, recibiremos una respuesta con código de estado apropiado y un mensaje de error:

```json
{
  "success": false,
  "message": "Error al buscar productos",
  "error": "Detalles del error"
}
```

**Posibles errores:**
- **400**: Falta el parámetro de búsqueda
- **500**: Error del servidor

## Detalle de la Implementación

El controlador `searchProducts` en `productController.js` maneja esta operación:

```javascript
export const searchProducts = async (req, res) => {
  try {
    // Parámetros de paginación
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Obtener término de búsqueda
    const searchQuery = req.query.search || '';
    
    // Validar que se proporcionó un término
    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar un término de búsqueda'
      });
    }
    
    // Construir el filtro de búsqueda utilizando expresiones regulares
    // para una búsqueda insensible a mayúsculas/minúsculas
    const searchFilter = {
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },      // Busca en el nombre
        { description: { $regex: searchQuery, $options: 'i' } } // Busca en la descripción
      ]
    };
    
    // Ejecutar la consulta de búsqueda con paginación
    const products = await Product.find(searchFilter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
      
    // Contar el total de resultados para la paginación
    const total = await Product.countDocuments(searchFilter);
    
    // Enviar respuesta con resultados y metadatos
    res.json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      products
    });
    
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar productos',
      error: error.message
    });
  }
};
```

## ¿Cómo Funciona la Búsqueda?

1. El controlador extrae el parámetro `search` de la URL
2. Crea un filtro de búsqueda usando expresiones regulares para buscar el texto en:
   - El nombre del producto (`name`)
   - La descripción del producto (`description`)
3. La búsqueda es insensible a mayúsculas/minúsculas con la opción `i`
4. Se aplica paginación según los parámetros `page` y `limit`
5. Se devuelven los resultados encontrados junto con metadatos de paginación

## MongoDB: Expresiones Regulares

La búsqueda utiliza expresiones regulares de MongoDB con el operador `$regex`:

```javascript
{ field: { $regex: pattern, $options: 'i' } }
```

- `$regex`: Define el patrón de búsqueda
- `$options: 'i'`: Hace la búsqueda insensible a mayúsculas/minúsculas
- `$or`: Permite buscar en múltiples campos

## Ejercicio Práctico

1. Busca productos que contengan la palabra "laptop"
2. Busca productos que contengan "pro" (debería encontrar "profesional", "producto", etc.)
3. Prueba la paginación limitando a 5 resultados por página
4. Intenta búsquedas sin proporcionar el parámetro search y observa el error

## Diagramas de Secuencia

```
Cliente                           Servidor                      Base de Datos
  |                                  |                               |
  | --- GET /products/search?... --> |                               |
  |                                  | --- Validar parámetros ---    |
  |                                  | --- Consulta con regex ---->  |
  |                                  | <-- Resultados -------------- |
  |                                  | --- Consulta count -------->  |
  |                                  | <-- Total ------------------ |
  | <-- Respuesta JSON con datos --- |                               |
```

## Conclusión

Este ejercicio mostró cómo usar el endpoint de búsqueda de productos por texto. La funcionalidad permite buscar productos por palabras clave en su nombre o descripción, lo que facilita a los usuarios encontrar productos específicos. La búsqueda es flexible (insensible a mayúsculas/minúsculas) y soporta paginación para manejar grandes cantidades de resultados.
