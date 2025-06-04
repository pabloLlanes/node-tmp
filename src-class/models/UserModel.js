import mongoose from 'mongoose';
import BaseModel from './BaseModel.js';

class UserModel extends BaseModel {
    constructor() {
        const userSchema = new mongoose.Schema({
            username: {
                type: String,
                required: [true, 'El nombre de usuario es obligatorio'],
                unique: true,
                trim: true
            },
            email: {
                type: String,
                required: [true, 'El correo electrónico es obligatorio'],
                unique: true,
                trim: true
            },
            password: {
                type: String,
                required: [true, 'La contraseña es obligatoria']
            },
            role: {
                type: String,
                enum: ['user', 'admin'],
                default: 'user'
            }
        }, {
            timestamps: true,
            toJSON: { virtuals: true },
            toObject: { virtuals: true }
        });

        // Virtual para relación con órdenes
        userSchema.virtual('orders', {
            ref: 'Order',
            localField: '_id',
            foreignField: 'user'
        });

        super('User', userSchema);
    }
}

export default new UserModel().getModel();
