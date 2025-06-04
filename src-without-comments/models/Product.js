import mongoose from 'mongoose';

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

const Product = mongoose.model('Product', productSchema);

export default Product;
