# Guu00eda de Modelos (Models)

## u00bfQuu00e9 son los Modelos?

Los modelos son representaciones estructuradas de los datos en la aplicaciu00f3n. En nuestro proyecto Node.js con MongoDB, los modelos se implementan usando Mongoose, un ODM (Object Document Mapper) que proporciona una capa de abstracciu00f3n sobre MongoDB. Los modelos:

1. **Definen la estructura** de los documentos en la base de datos
2. **Implementan validaciu00f3n** para garantizar la integridad de los datos
3. **Proporcionan mu00e9todos** para interactuar con la base de datos
4. **Establecen relaciones** entre diferentes colecciones

Cada modelo corresponde a una colecciu00f3n en MongoDB y define el esquema de sus documentos.

## Estructura de un Modelo

La estructura bu00e1sica de un modelo en nuestra aplicaciu00f3n es:

```javascript
// 1. Importaciu00f3n de Mongoose
import mongoose from 'mongoose';

// 2. Definiciu00f3n del esquema
const mySchema = new mongoose.Schema(
  {
    // Campos del esquema con sus tipos y validaciones
    field1: {
      type: String,
      required: [true, 'Mensaje de error si falta'],
      trim: true
    },
    field2: {
      type: Number,
      default: 0
    },
    field3: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OtherModel' // Referencia a otro modelo
    }
  },
  {
    // Opciones del esquema
    timestamps: true, // Agregar createdAt y updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// 3. Mu00e9todos estáticos o de instancia
mySchema.methods.customMethod = function() {
  // Lógica personalizada
};

// 4. Campos virtuales
mySchema.virtual('virtualField').get(function() {
  return this.field1 + ' ' + this.field2;
});

// 5. Hooks/Middleware de Mongoose
mySchema.pre('save', function(next) {
  // Lógica antes de guardar
  next();
});

// 6. Creación del modelo
const MyModel = mongoose.model('MyModel', mySchema);

// 7. Exportación
export default MyModel;
```

## Modelos Implementados

Nuestra aplicaciu00f3n implementa los siguientes modelos:

### 1. Modelo de Usuario (`User.js`)

Almacena informaciu00f3n de los usuarios registrados en la plataforma.

```javascript
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Por favor ingrese un nombre'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Por favor ingrese un email'],
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            trim: true,
            required: [true, 'Por favor ingrese password'],
        },
        role: {
            type: String,
            enum: ['USER_ROLE', 'ADMIN_ROLE'],
            default: 'USER_ROLE'
        },
        isActive: {
            type: Boolean,
            default: true
        },
        defaultShippingAddress: {
            street: String,
            city: String,
            postalCode: String,
            country: String
        }
    },
    {
        timestamps: true,
        // Habilitar virtuals cuando se convierte a JSON u Object
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Campo virtual para acceder a las órdenes del usuario
userSchema.virtual('orders', {
    ref: 'Order',           // Modelo a referenciar
    localField: '_id',      // Campo local que se relaciona
    foreignField: 'user'    // Campo en el modelo Order que hace referencia a este modelo
});
```

### 2. Modelo de Producto (`Product.js`)

Representa los productos disponibles en la plataforma.

```javascript
const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: [true, 'El nombre del producto es obligatorio']
        },
        description: {
            type: String,
            trim: true,
        },
        stock: {
            type: Number,
            default: 0,
        },
        isAvailable: {
            type: Boolean,
            default: true
        },
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        price: {
            type: Number,
            default: 0
        },
        image: {
            type: String,
            default: '/uploads/products/default.jpg'
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category'
        }
    },
    {
        timestamps: true,
    }
);
```

### 3. Modelo de Categoría (`Category.js`)

Clasificación para agrupar productos similares.

```javascript
const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'El nombre de la categoría es obligatorio'],
            trim: true,
            unique: true
        },
        description: {
            type: String,
            trim: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true,
    }
);
```

### 4. Modelo de Orden (`Order.js`)

Registra las compras realizadas por los usuarios.

```javascript
// Esquema para los items individuales dentro de una orden
const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'La cantidad debe ser al menos 1']
    },
    price: {
        type: Number,
        required: true
    },
});

// Esquema principal de la Orden/Compra
const orderSchema = new mongoose.Schema(
    {
        // Referencia al usuario que realizó la compra
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        // Array de productos incluidos en la orden
        items: [orderItemSchema],

        // Información de envío
        shippingAddress: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            postalCode: { type: String, required: true },
            country: { type: String, required: true }
        },

        // Información del pago
        paymentInfo: {
            method: {
                type: String,
                enum: ['credit_card', 'debit_card', 'paypal', 'cash'],
                default: 'credit_card'
            },
            status: {
                type: String,
                enum: ['pending', 'completed', 'failed', 'refunded'],
                default: 'pending'
            },
            paidAt: {
                type: Date
            }
        },

        // Valores calculados de la orden
        totalItems: {
            type: Number,
            required: true
        },
        totalPrice: {
            type: Number,
            required: true
        },

        // Estado de la orden
        status: {
            type: String,
            enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
            default: 'pending'
        },

        // Fechas de seguimiento
        deliveredAt: {
            type: Date
        }
    },
    {
        timestamps: true,
    }
);

// Método para calcular totales antes de guardar
orderSchema.pre('save', function (next) {
    // Calcular cantidad total de items
    this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);

    // Calcular precio total
    this.totalPrice = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    next();
});
```

## Tipos de Relaciones en MongoDB/Mongoose

En nuestra aplicaciu00f3n, implementamos varios tipos de relaciones entre modelos:

### 1. Referencias (Relaciones Normalizadas)

Utilizamos `mongoose.Schema.Types.ObjectId` con la propiedad `ref` para establecer referencias entre documentos:

```javascript
// Ejemplo: Relación Producto -> Categoría (muchos a uno)
category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
}

// Ejemplo: Relación Orden -> Usuario (muchos a uno)
user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
}
```

Estas referencias se "pueblan" (populate) cuando necesitamos acceder a los datos relacionados:

```javascript
// En un controlador
const product = await Product.findById(id).populate('category');
```

### 2. Subdocumentos (Relaciones Embebidas)

Para relaciones donde los datos relacionados siempre se consultan juntos y no crecen indefinidamente, usamos subdocumentos:

```javascript
// Ejemplo: Dirección de envío embebida en Usuario
defaultShippingAddress: {
    street: String,
    city: String,
    postalCode: String,
    country: String
}

// Ejemplo: Items de orden embebidos en Orden
items: [orderItemSchema]
```

### 3. Arrays de Referencias

Para relaciones de uno a muchos o muchos a muchos donde necesitamos mantener las colecciones separadas:

```javascript
// Ejemplo (no implementado directamente pero posible):
favorites: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }
]
```

### 4. Campos Virtuales

Para relaciones inversas que no necesitan almacenarse físicamente:

```javascript
// Ejemplo: Relación inversa Usuario -> Órdenes
userSchema.virtual('orders', {
    ref: 'Order',           // Modelo a referenciar
    localField: '_id',      // Campo local que se relaciona
    foreignField: 'user'    // Campo en el modelo Order que hace referencia a este modelo
});
```

## Diagrama de Relaciones

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

## Opciones de Esquema y Características Avanzadas

### 1. Timestamps

Todos nuestros modelos incluyen timestamps automáticos:

```javascript
{
    timestamps: true, // Agrega createdAt y updatedAt
}
```

### 2. Métodos de Instancia y Estáticos

Podemos agregar métodos personalizados a nuestros modelos:

```javascript
// Método de instancia (en un documento específico)
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Método estático (en el modelo)
userSchema.statics.findActiveUsers = function() {
    return this.find({ isActive: true });
};
```

### 3. Middleware/Hooks

Usamos hooks para ejecutar lógica antes o después de ciertas operaciones:

```javascript
// Pre-save hook para calcular totales en órdenes
orderSchema.pre('save', function (next) {
    this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
    this.totalPrice = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    next();
});

// Ejemplo potencial: Hash de contraseña antes de guardar
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});
```

### 4. Campos Virtuales

Los campos virtuales no se almacenan en la base de datos pero se calculan cuando se accede a ellos:

```javascript
// Campo virtual para nombre completo
userSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual con populate para relaciones inversas
userSchema.virtual('orders', {
    ref: 'Order',
    localField: '_id',
    foreignField: 'user'
});
```

## Validaciones

Nuestros modelos implementan validaciones a nivel de base de datos:

### 1. Validaciones de Tipo

```javascript
field: {
    type: String // Se validará que sea un string
}
```

### 2. Requerimientos

```javascript
name: {
    type: String,
    required: [true, 'Por favor ingrese un nombre']
}
```

### 3. Unicidad

```javascript
email: {
    type: String,
    unique: true
}
```

### 4. Enumeraciones

```javascript
role: {
    type: String,
    enum: ['USER_ROLE', 'ADMIN_ROLE'],
    default: 'USER_ROLE'
}
```

### 5. Validaciones Numéricas

```javascript
quantity: {
    type: Number,
    min: [1, 'La cantidad debe ser al menos 1']
}
```

## Mejores Prácticas Implementadas

1. **Separación de modelos**: Cada entidad tiene su propio archivo de modelo

2. **Validación a nivel de esquema**: Validaciones específicas para cada campo

3. **Relaciones bien definidas**: Uso apropiado de referencias y embebidos

4. **Valores por defecto**: Cada campo tiene valores por defecto apropiados

5. **Documentación detallada**: Comentarios claros explicando cada parte

6. **Middleware para lógica de negocio**: Hooks para operaciones automáticas

7. **Virtualización de relaciones**: Campos virtuales para relaciones inversas

## Patrones de Consulta Comunes

Basado en estos modelos, estos son algunos patrones comunes de consulta:

```javascript
// Buscar documentos con filtros
const products = await Product.find({ isAvailable: true, price: { $gt: 100 } });

// Buscar un documento por ID
const user = await User.findById(userId);

// Buscar y actualizar
const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    { $set: updates },
    { new: true } // Devuelve el documento actualizado
);

// Consultas con población de referencias
const order = await Order.findById(orderId)
    .populate('user')
    .populate('items.product');

// Consultas con campos específicos
const users = await User.find({}, 'name email');

// Consultas con ordenación y paginación
const products = await Product
    .find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

// Consultas con agregación
const stats = await Order.aggregate([
    { $match: { status: 'delivered' } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } }
]);
```

## Conclusión

Los modelos son la base de nuestra aplicación, definiendo la estructura de datos y las relaciones entre entidades. Nuestros modelos implementan validaciones robustas, relaciones bien definidas y características avanzadas como hooks y campos virtuales. Esta estructura garantiza la integridad de los datos y facilita las operaciones complejas a nivel de la base de datos.
