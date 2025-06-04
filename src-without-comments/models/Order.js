import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
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
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
    }
}, {
    timestamps: true
});

orderSchema.pre('save', function (next) {
    this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);

    this.totalPrice = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
