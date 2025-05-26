import mongoose from 'mongoose';

/**
 * Esquema para los items individuales dentro de una orden
 * 
 * Este sub-esquema permite guardar detalles de cada producto 
 * en la orden, junto con su cantidad y precio al momento de la compra
 */
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

/**
 * Esquema principal de la Orden/Compra
 * 
 * Define la estructura de una compra realizada por un usuario,
 * incluyendo los productos comprados, dirección de envío, 
 * estado del pago y de la entrega
 */
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
        timestamps: true, // Añade createdAt y updatedAt automáticamente
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

const Order = mongoose.model('Order', orderSchema);

export default Order;
