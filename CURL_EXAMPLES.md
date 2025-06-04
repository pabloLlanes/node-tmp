# Ejemplos de CURL para la API de E-Commerce

Este documento proporciona ejemplos detallados de cómo interactuar con todos los endpoints de la API usando comandos curl. Estos ejemplos son útiles para pruebas, depuración y como referencia para desarrolladores frontend.

## Tabla de Contenidos

- [Autenticación](#autenticación)
- [Usuarios](#usuarios)
- [Productos](#productos)
- [Categorías](#categorías)
- [Órdenes](#órdenes)
- [Relaciones](#relaciones)
- [Subida de archivos](#subida-de-archivos)

## Variables comunes

Para mayor claridad, reemplaza estos valores en los ejemplos:

- `localhost:3000`: Reemplaza con la URL base de tu API
- `TU_TOKEN_JWT`: Reemplaza con un token JWT válido
- IDs de ejemplo como `645a1c8b1f7fa9b5e7a12345`: Reemplaza con IDs reales de tu base de datos

## Autenticación

### Registro de usuario

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "password": "contraseña123"
  }' \
  http://localhost:3000/api/auth/register
```

### Inicio de sesión

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@ejemplo.com",
    "password": "contraseña123"
  }' \
  http://localhost:3000/api/auth/login
```

## Usuarios

### Obtener todos los usuarios (solo admin)

```bash
curl -X GET \
  -H "Authorization: TU_TOKEN_JWT" \
  http://localhost:3000/api/users
```

### Obtener usuario por ID

```bash
curl -X GET \
  -H "Authorization: TU_TOKEN_JWT" \
  http://localhost:3000/api/users/645a1c8b1f7fa9b5e7a12345
```

### Actualizar usuario

```bash
curl -X PUT \
  -H "Content-Type: application/json" \
  -H "Authorization: TU_TOKEN_JWT" \
  -d '{
    "name": "Juan Pérez Actualizado",
    "defaultShippingAddress": {
      "street": "Calle Principal 123",
      "city": "Ciudad Ejemplo",
      "postalCode": "12345",
      "country": "Argentina"
    }
  }' \
  http://localhost:3000/api/users/645a1c8b1f7fa9b5e7a12345
```

### Eliminar usuario (desactivar)

```bash
curl -X DELETE \
  -H "Authorization: TU_TOKEN_JWT" \
  http://localhost:3000/api/users/645a1c8b1f7fa9b5e7a12345
```

## Productos

### Obtener todos los productos (paginados)

```bash
curl -X GET \
  http://localhost:3000/api/products?page=1&limit=10
```

### Búsqueda de productos por texto

```bash
curl -X GET \
  http://localhost:3000/api/products/search?search=macbook&page=1&limit=10
```

### Filtrar productos por precio y disponibilidad

```bash
curl -X GET \
  http://localhost:3000/api/products/filter?minPrice=1000&maxPrice=5000&isAvailable=true&page=1&limit=10
```

### Obtener producto por ID

```bash
curl -X GET \
  http://localhost:3000/api/products/645a1c8b1f7fa9b5e7a12345
```

### Crear un nuevo producto

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: TU_TOKEN_JWT" \
  -d '{
    "name": "Smartphone XYZ",
    "price": 599.99,
    "description": "Smartphone de última generación",
    "category": "645a1c8b1f7fa9b5e7a12345",
    "stock": 15,
    "isAvailable": true
  }' \
  http://localhost:3000/api/products
```

### Actualizar un producto completamente (PUT)

```bash
curl -X PUT \
  -H "Content-Type: application/json" \
  -H "Authorization: TU_TOKEN_JWT" \
  -d '{
    "name": "Smartphone XYZ Actualizado",
    "price": 649.99,
    "description": "Versión mejorada del smartphone",
    "category": "645a1c8b1f7fa9b5e7a12345",
    "stock": 20,
    "isAvailable": true
  }' \
  http://localhost:3000/api/products/645a1c8b1f7fa9b5e7a12345
```

### Actualizar un producto parcialmente (PATCH)

```bash
curl -X PATCH \
  -H "Content-Type: application/json" \
  -H "Authorization: TU_TOKEN_JWT" \
  -d '{
    "price": 629.99,
    "stock": 18
  }' \
  http://localhost:3000/api/products/645a1c8b1f7fa9b5e7a12345
```

### Eliminar un producto

```bash
curl -X DELETE \
  -H "Authorization: TU_TOKEN_JWT" \
  http://localhost:3000/api/products/645a1c8b1f7fa9b5e7a12345
```

## Categorías

### Obtener todas las categorías

```bash
curl -X GET \
  http://localhost:3000/api/categories
```

### Obtener categoría por ID

```bash
curl -X GET \
  http://localhost:3000/api/categories/645a1c8b1f7fa9b5e7a12345
```

### Obtener productos por categoría

```bash
curl -X GET \
  http://localhost:3000/api/categories/645a1c8b1f7fa9b5e7a12345/products?page=1&limit=10
```

### Crear una nueva categoría

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: TU_TOKEN_JWT" \
  -d '{
    "name": "Electrónica",
    "description": "Productos electrónicos y tecnológicos"
  }' \
  http://localhost:3000/api/categories
```

### Actualizar una categoría completamente (PUT)

```bash
curl -X PUT \
  -H "Content-Type: application/json" \
  -H "Authorization: TU_TOKEN_JWT" \
  -d '{
    "name": "Electrónica y Tecnología",
    "description": "Productos electrónicos, gadgets y accesorios tecnológicos"
  }' \
  http://localhost:3000/api/categories/645a1c8b1f7fa9b5e7a12345
```

### Actualizar una categoría parcialmente (PATCH)

```bash
curl -X PATCH \
  -H "Content-Type: application/json" \
  -H "Authorization: TU_TOKEN_JWT" \
  -d '{
    "description": "Productos electrónicos y tecnología moderna"
  }' \
  http://localhost:3000/api/categories/645a1c8b1f7fa9b5e7a12345
```

### Eliminar una categoría

```bash
curl -X DELETE \
  -H "Authorization: TU_TOKEN_JWT" \
  http://localhost:3000/api/categories/645a1c8b1f7fa9b5e7a12345
```

## Órdenes

### Crear una nueva orden

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: TU_TOKEN_JWT" \
  -d '{
    "items": [
      {
        "product": "645a1c8b1f7fa9b5e7a12345",
        "quantity": 2
      },
      {
        "product": "645a1c8b1f7fa9b5e7a67890",
        "quantity": 1
      }
    ],
    "shippingAddress": {
      "street": "Calle Principal 123",
      "city": "Ciudad Ejemplo",
      "postalCode": "12345",
      "country": "Argentina"
    },
    "paymentInfo": {
      "method": "credit_card"
    }
  }' \
  http://localhost:3000/api/orders
```

### Obtener todas las órdenes del usuario

```bash
curl -X GET \
  -H "Authorization: TU_TOKEN_JWT" \
  http://localhost:3000/api/orders
```

### Obtener una orden específica

```bash
curl -X GET \
  -H "Authorization: TU_TOKEN_JWT" \
  http://localhost:3000/api/orders/645a1c8b1f7fa9b5e7a12345
```

### Actualizar estado de una orden

```bash
curl -X PATCH \
  -H "Content-Type: application/json" \
  -H "Authorization: TU_TOKEN_JWT" \
  -d '{
    "status": "shipped",
    "paymentStatus": "completed"
  }' \
  http://localhost:3000/api/orders/645a1c8b1f7fa9b5e7a12345/status
```

### Cancelar una orden

```bash
curl -X POST \
  -H "Authorization: TU_TOKEN_JWT" \
  http://localhost:3000/api/orders/645a1c8b1f7fa9b5e7a12345/cancel
```

## Relaciones

### Asignar un usuario como creador de un producto

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: TU_TOKEN_JWT" \
  -d '{
    "userId": "645a1c8b1f7fa9b5e7a67890"
  }' \
  http://localhost:3000/api/relations/products/645a1c8b1f7fa9b5e7a12345/creator
```

### Asignar una categoría a un producto

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: TU_TOKEN_JWT" \
  -d '{
    "categoryId": "645a1c8b1f7fa9b5e7a12345"
  }' \
  http://localhost:3000/api/relations/products/645a1c8b1f7fa9b5e7a67890/category
```

### Asignar múltiples productos a una categoría

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: TU_TOKEN_JWT" \
  -d '{
    "productIds": [
      "645a1c8b1f7fa9b5e7a11111",
      "645a1c8b1f7fa9b5e7a22222",
      "645a1c8b1f7fa9b5e7a33333"
    ]
  }' \
  http://localhost:3000/api/relations/categories/645a1c8b1f7fa9b5e7a12345/products
```

### Obtener productos de un usuario

```bash
curl -X GET \
  -H "Authorization: TU_TOKEN_JWT" \
  http://localhost:3000/api/relations/users/645a1c8b1f7fa9b5e7a67890/products?page=1&limit=10
```

## Subida de archivos

### Subir imagen de producto

```bash
curl -X POST \
  -H "Authorization: TU_TOKEN_JWT" \
  -F "image=@/ruta/a/tu/imagen.jpg" \
  http://localhost:3000/api/products/645a1c8b1f7fa9b5e7a12345/upload-image
```

## Notas sobre los comandos curl

1. **Formato multipart/form-data**: Para subir archivos, se usa `-F` en lugar de `-d` y el formato `nombre=@ruta/al/archivo`

2. **Headers de autenticación**: Casi todas las operaciones excepto consultas públicas requieren el header `Authorization` con un JWT válido

3. **Paginación**: Para endpoints que devuelven múltiples resultados, usa `?page=X&limit=Y` para controlar la paginación

4. **Respuestas**: Todas las respuestas siguen el formato estándar:

   ```json
   {
     "success": true,
     "message": "Mensaje informativo",
     "data": {...}  // Puede ser products, categories, etc.
   }
   ```

5. **Manejo de errores**: En caso de error, la respuesta tendrá `"success": false` y un mensaje descriptivo
