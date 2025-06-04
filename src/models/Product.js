// Importamos mongoose, el ODM (Object Data Modeling) para MongoDB en Node.js
import mongoose from 'mongoose';

/**
 * Definición del esquema de Producto para MongoDB.
 * Este esquema representa los productos que se almacenarán en la base de datos.
 * Incluye validaciones, tipos de datos y referencias a otros modelos.
 */
const productSchema = new mongoose.Schema(
    {
        // Nombre del producto (obligatorio, se elimina espacio extra)
        name: {
            type: String,
            trim: true,
            required: [true, 'El nombre del producto es obligatorio']
        },

        // Descripción breve del producto (opcional)
        description: {
            type: String,
            trim: true,
        },

        // Cantidad de stock disponible (por defecto: 0)
        stock: {
            type: Number,
            default: 0,
        },

        // Indica si el producto está disponible para la venta
        isAvailable: {
            type: Boolean,
            default: true
        },

        // Referencia al usuario que creó el producto (opcional)
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            // No es obligatorio para permitir productos sin creador asignado
        },

        // Precio del producto (por defecto: 0)
        price: {
            type: Number,
            default: 0
        },

        // URL de la imagen del producto (por defecto: imagen genérica)
        image: {
            type: String,
            default: '/uploads/products/default.jpg'
        },

        // Referencia a la categoría del producto
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category'
        }
    },
    {
        // Agrega automáticamente campos createdAt y updatedAt
        timestamps: true,
    }
);

// Creamos el modelo Product a partir del esquema definido
const Product = mongoose.model('Product', productSchema);

// Exportamos el modelo para su uso en otros archivos
export default Product;