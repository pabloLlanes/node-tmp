// Importamos mongoose, el ODM para MongoDB
import mongoose from 'mongoose';

/**
 * Esquema de Usuario para MongoDB.
 * Representa a los usuarios de la aplicación, incluyendo roles y autenticación.
 */
const userSchema = new mongoose.Schema({
    // Nombre de usuario (único y obligatorio)
    username: {
        type: String,
        required: [true, 'El nombre de usuario es obligatorio'],
        unique: true,
        trim: true
    },
    // Correo electrónico (único y obligatorio)
    email: {
        type: String,
        required: [true, 'El correo electrónico es obligatorio'],
        unique: true,
        trim: true
    },
    // Contraseña (obligatoria, debe ser almacenada hasheada)
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    // Rol del usuario (por defecto: 'user', puede ser 'admin')
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

// Campo virtual para acceder a las órdenes del usuario
userSchema.virtual('orders', {
    ref: 'Order',           // Modelo a referenciar
    localField: '_id',      // Campo local que se relaciona
    foreignField: 'user'    // Campo en el modelo Order que hace referencia a este modelo
});

// Campo virtual para acceder a las órdenes del usuario
// No se almacena en la base de datos, pero permite una relación bidireccional
userSchema.virtual('orders', {
    ref: 'Order',           // Modelo a referenciar
    localField: '_id',      // Campo local que se relaciona
    foreignField: 'user'    // Campo en el modelo Order que hace referencia a este modelo
});

const User = mongoose.model('User', userSchema);

export default User;