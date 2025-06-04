import mongoose from 'mongoose';
import BaseModel from './BaseModel.js';

class ProductModel extends BaseModel {
    constructor() {
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

        super('Product', productSchema);
    }
}

export default new ProductModel().getModel();
