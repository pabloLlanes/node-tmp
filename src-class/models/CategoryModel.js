import mongoose from 'mongoose';
import BaseModel from './BaseModel.js';

class CategoryModel extends BaseModel {
    constructor() {
        const categorySchema = new mongoose.Schema({
            name: {
                type: String,
                required: [true, 'El nombre de la categoría es obligatorio'],
                unique: true,
                trim: true
            },
            description: {
                type: String,
                trim: true
            }
        }, {
            timestamps: true,
            toJSON: { virtuals: true },
            toObject: { virtuals: true }
        });

        // Virtual para relacionar productos con categoría
        categorySchema.virtual('products', {
            ref: 'Product',
            localField: '_id',
            foreignField: 'category'
        });

        super('Category', categorySchema);
    }
}

export default new CategoryModel().getModel();
