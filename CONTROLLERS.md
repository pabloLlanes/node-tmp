# Guía de Controladores (Controllers)

## ¿Qué son los Controladores?

Los controladores son componentes fundamentales en una aplicaciones de Node.js que siguen el patrón MVC (Modelo-Vista-Controlador). Son responsables de:

1. **Recibir solicitudes** de los clientes a través de las rutas
2. **Procesar los datos** utilizando la lógica de negocio
3. **Interactuar con los modelos** para acceder o modificar la base de datos
4. **Devolver respuestas** formateadas al cliente

En nuestra API, los controladores actúan como intermediarios entre las rutas HTTP y los modelos de datos.

## Estructura de un Controlador

Cada controlador en nuestra aplicación sigue una estructura consistente:

```javascript
// 1. Importaciones necesarias
import Model from '../models/Model.js';

// 2. Función del controlador (usando sintaxis de arrow function)
export const functionName = async (req, res) => {
  try {
    // 3. Extracción de datos de la solicitud
    const { param1, param2 } = req.body; // O req.params, req.query

    // 4. Lógica de negocio y operaciones con la base de datos
    const result = await Model.operation();

    // 5. Respuesta exitosa
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    // 6. Manejo de errores
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Mensaje de error',
      error: error.message,
    });
  }
};
```

## Controladores Implementados

Nuestra API implementa los siguientes controladores:

### 1. Controlador de Usuarios (`userController.js`)

Maneja todas las operaciones relacionadas con los usuarios:

- Registro de usuarios
- Inicio de sesión y autenticación
- Obtención de perfiles de usuario
- Actualización de datos de usuario
- Eliminación de cuentas

### 2. Controlador de Productos (`productController.js`)

Gestiona el catálogo de productos:

- Listado de productos (con paginación)
- Búsqueda y filtrado de productos
- Creación de nuevos productos
- Actualización de productos existentes
- Eliminación de productos
- Subida de imágenes de productos

### 3. Controlador de Categorías (`categoryController.js`)

Administra las categorías de productos:

- Listado de categorías
- Creación de nuevas categorías
- Actualización de categorías
- Eliminación de categorías
- Obtención de productos por categoría

### 4. Controlador de Órdenes (`orderController.js`)

Maneja el proceso de compra y las órdenes:

- Creación de nuevas órdenes
- Listado de órdenes de un usuario
- Actualización del estado de las órdenes
- Cancelación de órdenes

## Patrones Comunes en los Controladores

### 1. Manejo de Errores Try/Catch

Todos nuestros controladores utilizan bloques try/catch para capturar excepciones:

```javascript
try {
  // Lógica del controlador
} catch (error) {
  console.log(error); // Registrar el error para depuración
  res.status(500).json({
    success: false,
    message: 'Mensaje descriptivo del error',
    error: error.message, // Detalles del error (solo para desarrollo)
  });
}
```

### 2. Validación de Datos

La validaciu00f3n principal se realiza en las rutas con express-validator, pero los controladores también realizan validaciones específicas del dominio:

```javascript
// Validación de existencia
const item = await Model.findById(id);
if (!item) {
  return res.status(404).json({
    success: false,
    message: 'Item no encontrado',
  });
}

// Validación de permisos
if (item.creator.toString() !== req.user._id.toString()) {
  return res.status(403).json({
    success: false,
    message: 'No tiene permisos para esta operación',
  });
}
```

### 3. Paginación

Para endpoints que devuelven múltiples resultados, implementamos paginación consistente:

```javascript
// Extraer parámetros de paginación
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const skip = (page - 1) * limit;

// Consulta con paginación
const items = await Model.find()
  .skip(skip)
  .limit(limit)
  .sort({ createdAt: -1 });

// Total para cu00e1lculo de pu00e1ginas
const total = await Model.countDocuments();

// Metadatos de paginación en la respuesta
res.json({
  success: true,
  count: items.length,
  total,
  totalPages: Math.ceil(total / limit),
  currentPage: page,
  items,
});
```

### 4. Formato de Respuestas

Todas las respuestas siguen un formato estándar para consistencia:

```javascript
// Respuesta exitosa
res.status(200).json({
  success: true,
  message: 'Operación completada con éxito',
  data: result, // Puede ser un objeto o array
});

// Respuesta de error
res.status(errorCode).json({
  success: false,
  message: 'Mensaje descriptivo del error',
  error: errorDetails, // Opcional, para desarrollo
});
```

## Ejemplos Detallados

### Ejemplo 1: Creación de un Producto

```javascript
export const createProduct = async (req, res) => {
  try {
    // 1. Extraer datos del cuerpo de la solicitud
    const { name, price, description, category, available, stock, image } =
      req.body;

    // 2. Validar categoría si se proporciona
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: 'La categoría especificada no existe',
        });
      }
    }

    // 3. Crear producto con el creador actual
    const newProduct = await Product.create({
      name,
      price,
      description,
      category,
      available,
      stock,
      image,
      creator: req.user ? req.user._id : null, // Asignar usuario autenticado como creador
    });

    // 4. Responder con el producto creado
    res.status(201).json({
      success: true,
      product: newProduct,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el producto',
      error: error.message,
    });
  }
};
```

### Ejemplo 2: Búsqueda de Productos

```javascript
export const searchProducts = async (req, res) => {
  try {
    // 1. Paru00e1metros de paginación
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 2. Obtener término de búsqueda
    const searchQuery = req.query.search || '';

    // 3. Validar que se proporcionó un término
    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporcione un término de búsqueda',
      });
    }

    // 4. Construir consulta de búsqueda (insensible a mayúsculas/minúsculas)
    const searchRegex = new RegExp(searchQuery, 'i');
    const query = {
      $or: [{ name: searchRegex }, { description: searchRegex }],
    };

    // 5. Ejecutar consulta con paginación
    const products = await Product.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // 6. Contar total de resultados para paginación
    const total = await Product.countDocuments(query);

    // 7. Respuesta con metadatos de paginación
    res.json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Error en la búsqueda de productos',
      error: error.message,
    });
  }
};
```

## Mejores Prácticas Implementadas

1. **Separación de responsabilidades**: Cada controlador se encarga de una entidad específica

2. **Consistencia**: Estructura similar en todos los controladores para facilitar el mantenimiento

3. **Manejo de errores robusto**: Try/catch en todas las funciones asíncronas

4. **Validación exhaustiva**: Comprobaciones tanto a nivel de ruta como dentro del controlador

5. **Comentarios descriptivos**: Documentación clara sobre el propósito y funcionamiento

6. **Respuestas estandarizadas**: Formato consistente en todas las respuestas

7. **Seguridad**: Verificación de permisos basada en roles y propiedad

## Conclusión

Los controladores son el corazón lógico de nuestra API RESTful. Siguen patrones consistentes y están diseñados para ser legibles, mantenibles y seguros. Cada controlador implementa operaciones CRUD y lógica de negocio específica para su dominio, mientras mantiene un formato de respuesta consistente para toda la API.
