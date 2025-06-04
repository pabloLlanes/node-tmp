# Ejercicio 4: Actualización Parcial de Productos (PATCH)

Este ejercicio explica paso a paso cómo actualizar parcialmente un producto utilizando el método PATCH en la API RESTful del proyecto Node.js.

## Objetivo

Entender la diferencia entre PUT y PATCH, y aprender a actualizar parcialmente un producto sin necesidad de enviar todos sus campos.

## Requisitos Previos

- Tener el servidor Node.js ejecutándose (npm run dev)
- Un cliente HTTP como Postman, Insomnia o Thunder Client
- Tener productos creados en la base de datos

## Pasos para Actualizar Parcialmente un Producto (PATCH)

### 1. Preparar la Petición

Para actualizar parcialmente un producto, utilizaremos una solicitud PATCH a la siguiente ruta:

```
PATCH http://localhost:3000/api/products/:id
```

Donde `:id` es el identificador MongoDB del producto que deseas actualizar.

### 2. Configurar el Encabezado (Header)

Configuramos el encabezado para indicar que estamos enviando datos en formato JSON:

```
Content-Type: application/json
```

### 3. Preparar el Cuerpo de la Petición (Body)

El cuerpo de la petición debe contener **solo los campos que deseas actualizar** en formato JSON:

```json
{
  "price": 1199.99,
  "stock": 20
}
```

**Ventaja del PATCH:** No necesitas enviar todos los campos del producto, solo aquellos que quieres modificar.

### 4. Enviar la Petición

Una vez que tenemos la petición configurada con el ID correcto y los campos a actualizar, la enviamos al servidor.

### 5. Analizar la Respuesta

Si la actualización es exitosa, recibiremos una respuesta con código de estado **200** con el siguiente formato:

```json
{
  "success": true,
  "message": "Producto actualizado correctamente",
  "product": {
    "_id": "65a23f48b731c123456789ab",
    "name": "Laptop Lenovo ThinkPad",
    "price": 1199.99,           // ¡Precio actualizado!
    "description": "Laptop profesional con procesador Intel Core i7...",
    "category": "6463d6e2e88aed4b23b3a268",
    "available": true,
    "stock": 20,                // ¡Stock actualizado!
    "image": "/images/laptop-thinkpad.jpg",
    "creator": "65a1d8e9cde123456789cd",
    "createdAt": "2023-01-12T21:23:20.221Z",
    "updatedAt": "2023-01-13T14:45:32.587Z"  // ¡Fecha de actualización modificada!
  }
}
```

### 6. Manejo de Errores

Si ocurre algún error durante la actualización, recibiremos una respuesta con código de estado apropiado y un mensaje de error:

```json
{
  "success": false,
  "message": "Error al actualizar el producto",
  "error": "Detalles del error"
}
```

**Posibles errores:**
- **404**: Producto no encontrado
- **400**: Datos de entrada inválidos
- **500**: Error del servidor

## Diferencia entre PUT y PATCH

- **PUT**: Reemplaza completamente el recurso. Se deben enviar todos los campos, incluso los que no cambian.
- **PATCH**: Actualiza parcialmente el recurso. Solo se envían los campos que se desean modificar.

## Detalle de la Implementación

El controlador `patchProduct` en `productController.js` maneja esta operación:

```javascript
export const patchProduct = async (req, res) => {
  try {
    // Extraer el ID del producto a actualizar
    const productId = req.params.id;
    
    // Extraer los campos a actualizar del body
    const updates = req.body;
    
    // Verificar si el producto existe
    const existingProduct = await Product.findById(productId);
    
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    // Opcional: Verificar permisos de actualización
    // if (req.user && existingProduct.creator && 
    //     existingProduct.creator.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({ 
    //     success: false, 
    //     message: 'No tienes permiso para actualizar este producto' 
    //   });
    // }
    
    // Actualizar el producto con los campos proporcionados
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: updates },       // Usar $set para actualizar solo los campos proporcionados
      { new: true }            // Devolver el documento actualizado
    );
    
    // Enviar respuesta con el producto actualizado
    res.json({
      success: true,
      message: 'Producto actualizado correctamente',
      product: updatedProduct
    });
    
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el producto',
      error: error.message
    });
  }
};
```

## ¿Cómo Funciona la Actualización PATCH?

1. El controlador extrae el ID del producto de los parámetros de la URL
2. Obtiene los campos a actualizar del cuerpo de la petición
3. Verifica que el producto exista antes de intentar actualizarlo
4. Utiliza el método `findByIdAndUpdate` de Mongoose con:
   - El operador `$set` que solo actualiza los campos proporcionados
   - La opción `{ new: true }` para devolver el documento ya actualizado
5. Devuelve el producto actualizado en la respuesta

## MongoDB: Operador $set

En MongoDB, el operador `$set` es clave para las actualizaciones parciales:

```javascript
// Actualiza solo los campos especificados
db.collection.updateOne(
  { _id: id },
  { $set: { campo1: valor1, campo2: valor2 } }
)
```

Sin `$set`, MongoDB reemplazaría todo el documento, similar a un PUT.

## Ejercicio Práctico

1. Actualiza el precio de un producto existente
2. Actualiza múltiples campos a la vez (precio y stock)
3. Intenta actualizar un producto que no existe (con un ID inválido)
4. Verifica que los cambios se hayan aplicado haciendo una consulta GET al mismo producto

## Diagramas de Secuencia

```
Cliente                       Servidor                    Base de Datos
  |                               |                             |
  | --- PATCH /products/:id ----> |                             |
  |                               | --- Buscar producto -----> |
  |                               | <-- Producto existente --- |
  |                               | --- Actualizar con $set --> |
  |                               | <-- Producto actualizado -- |
  | <-- Respuesta con producto -- |                             |
```

## Casos de Uso Comunes

- Actualizar el precio de un producto sin tocar otros campos
- Modificar el stock después de una venta
- Cambiar la disponibilidad de un producto (available: true/false)
- Actualizar la descripción o información del producto

## Conclusión

Este ejercicio mostró cómo usar el método PATCH para actualizar parcialmente un producto. A diferencia de PUT, PATCH permite enviar solo los campos que necesitan ser actualizados, lo que lo hace más eficiente y práctico para actualizaciones parciales. Esta técnica es ampliamente utilizada en APIs RESTful modernas para minimizar la cantidad de datos transferidos y reducir el riesgo de sobrescribir accidentalmente información.
