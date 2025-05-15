import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
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
        }
    },
    {
        timestamps: true,
    }
);

const Product = mongoose.model('Product', productSchema);

export default Product;