# Guu00eda de Controladores (Controllers)

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
- Inicio de sesiu00f3n y autenticaciu00f3n
- Obtenciu00f3n de perfiles de usuario
- Actualizaciu00f3n de datos de usuario
- Eliminaciu00f3n de cuentas

### 2. Controlador de Productos (`productController.js`)

Gestiona el catu00e1logo de productos:

- Listado de productos (con paginaciu00f3n)
- Bu00fasqueda y filtrado de productos
- Creaciu00f3n de nuevos productos
- Actualizaciu00f3n de productos existentes
- Eliminaciu00f3n de productos
- Subida de imu00e1genes de productos

### 3. Controlador de Categoru00edas (`categoryController.js`)

Administra las categoru00edas de productos:

- Listado de categoru00edas
- Creaciu00f3n de nuevas categoru00edas
- Actualizaciu00f3n de categoru00edas
- Eliminaciu00f3n de categoru00edas
- Obtenciu00f3n de productos por categoru00eda

### 4. Controlador de u00d3rdenes (`orderController.js`)

Maneja el proceso de compra y las u00f3rdenes:

- Creaciu00f3n de nuevas u00f3rdenes
- Listado de u00f3rdenes de un usuario
- Actualizaciu00f3n del estado de las u00f3rdenes
- Cancelaciu00f3n de u00f3rdenes

## Patrones Comunes en los Controladores

### 1. Manejo de Errores Try/Catch

Todos nuestros controladores utilizan bloques try/catch para capturar excepciones:

```javascript
try {
  // Lu00f3gica del controlador
} catch (error) {
  console.log(error); // Registrar el error para depuraciu00f3n
  res.status(500).json({
    success: false,
    message: 'Mensaje descriptivo del error',
    error: error.message, // Detalles del error (solo para desarrollo)
  });
}
```

### 2. Validaciu00f3n de Datos

La validaciu00f3n principal se realiza en las rutas con express-validator, pero los controladores tambiu00e9n realizan validaciones especu00edficas del dominio:

```javascript
// Validaciu00f3n de existencia
const item = await Model.findById(id);
if (!item) {
  return res.status(404).json({
    success: false,
    message: 'Item no encontrado',
  });
}

// Validaciu00f3n de permisos
if (item.creator.toString() !== req.user._id.toString()) {
  return res.status(403).json({
    success: false,
    message: 'No tiene permisos para esta operaciu00f3n',
  });
}
```

### 3. Paginaciu00f3n

Para endpoints que devuelven mu00faltiples resultados, implementamos paginaciu00f3n consistente:

```javascript
// Extraer paru00e1metros de paginaciu00f3n
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const skip = (page - 1) * limit;

// Consulta con paginaciu00f3n
const items = await Model.find()
  .skip(skip)
  .limit(limit)
  .sort({ createdAt: -1 });

// Total para cu00e1lculo de pu00e1ginas
const total = await Model.countDocuments();

// Metadatos de paginaciu00f3n en la respuesta
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

Todas las respuestas siguen un formato estu00e1ndar para consistencia:

```javascript
// Respuesta exitosa
res.status(200).json({
  success: true,
  message: 'Operaciu00f3n completada con u00e9xito',
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

### Ejemplo 1: Creaciu00f3n de un Producto

```javascript
export const createProduct = async (req, res) => {
  try {
    // 1. Extraer datos del cuerpo de la solicitud
    const { name, price, description, category, available, stock, image } =
      req.body;

    // 2. Validar categoru00eda si se proporciona
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: 'La categoru00eda especificada no existe',
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

### Ejemplo 2: Bu00fasqueda de Productos

```javascript
export const searchProducts = async (req, res) => {
  try {
    // 1. Paru00e1metros de paginaciu00f3n
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 2. Obtener tu00e9rmino de bu00fasqueda
    const searchQuery = req.query.search || '';

    // 3. Validar que se proporcionu00f3 un tu00e9rmino
    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporcione un tu00e9rmino de bu00fasqueda',
      });
    }

    // 4. Construir consulta de bu00fasqueda (insensible a mayu00fasculas/minu00fasculas)
    const searchRegex = new RegExp(searchQuery, 'i');
    const query = {
      $or: [{ name: searchRegex }, { description: searchRegex }],
    };

    // 5. Ejecutar consulta con paginaciu00f3n
    const products = await Product.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // 6. Contar total de resultados para paginaciu00f3n
    const total = await Product.countDocuments(query);

    // 7. Respuesta con metadatos de paginaciu00f3n
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
      message: 'Error en la bu00fasqueda de productos',
      error: error.message,
    });
  }
};
```

## Mejores Pru00e1cticas Implementadas

1. **Separaciu00f3n de responsabilidades**: Cada controlador se encarga de una entidad especu00edfica

2. **Consistencia**: Estructura similar en todos los controladores para facilitar el mantenimiento

3. **Manejo de errores robusto**: Try/catch en todas las funciones asu00edncronas

4. **Validaciu00f3n exhaustiva**: Comprobaciones tanto a nivel de ruta como dentro del controlador

5. **Comentarios descriptivos**: Documentaciu00f3n clara sobre el propu00f3sito y funcionamiento

6. **Respuestas estandarizadas**: Formato consistente en todas las respuestas

7. **Seguridad**: Verificaciu00f3n de permisos basada en roles y propiedad

## Conclusiu00f3n

Los controladores son el corazu00f3n lu00f3gico de nuestra API RESTful. Siguen patrones consistentes y estu00e1n diseu00f1ados para ser legibles, mantenibles y seguros. Cada controlador implementa operaciones CRUD y lu00f3gica de negocio especu00edfica para su dominio, mientras mantiene un formato de respuesta consistente para toda la API.
