import mongoose from 'mongoose';
import BaseModel from './BaseModel.js';

class OrderModel extends BaseModel {
    constructor() {
        const orderSchema = new mongoose.Schema({
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            items: [
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
                    },
                    price: {
                        type: Number,
                        required: true
                    },
                    name: {
                        type: String,
                        required: true
                    }
                }
            ],
            totalItems: {
                type: Number,
                required: true
            },
            totalPrice: {
                type: Number,
                required: true
            },
            status: {
                type: String,
                enum: ['pending', 'completed', 'cancelled'],
                default: 'pending'
            },
            shippingAddress: {
                street: String,
                city: String,
                state: String,
                zip: String
            }
        }, {
            timestamps: true
        });

        // Pre-save hook para calcular totales
        orderSchema.pre('save', function (next) {
            if (this.items && this.items.length > 0) {
                this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
                this.totalPrice = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            }
            next();
        });

        super('Order', orderSchema);
    }
}

export default new OrderModel().getModel();
