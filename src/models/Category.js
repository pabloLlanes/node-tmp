// Importamos mongoose, el ODM para MongoDB
import mongoose from 'mongoose';

/**
 * Esquema de Categoría para MongoDB.
 * Representa las categorías a las que pueden pertenecer los productos.
 */
const categorySchema = new mongoose.Schema({
    // Nombre de la categoría (único y obligatorio)
    name: {
        type: String,
        trim: true,
        required: [true, 'El nombre de la categoría es obligatorio'],
        unique: true
    },
    // Descripción de la categoría (opcional)
    description: {
        type: String,
        trim: true
    },
    // Usuario que creó la categoría (opcional)
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
},
{
    // Agrega automáticamente createdAt y updatedAt
    timestamps: true
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
