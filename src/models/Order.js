// Importamos mongoose, el ODM para MongoDB
import mongoose from 'mongoose';

/**
 * Esquema de Orden de Compra para MongoDB.
 * Representa las compras realizadas por los usuarios, incluyendo productos y estado.
 */
const orderSchema = new mongoose.Schema({
    // Referencia al usuario que realizó la orden (obligatorio)
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Lista de productos incluidos en la orden
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            }
        }
    ],
    // Total de la orden (obligatorio)
    total: {
        type: Number,
        required: true
    },
    // Estado de la orden
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Método para calcular totales antes de guardar
orderSchema.pre('save', function (next) {
    // Calcular cantidad total de items
    this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);

    // Calcular precio total
    this.totalPrice = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
