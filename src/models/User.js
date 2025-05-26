import mongoose from 'mongoose';

/**
 * Esquema para el modelo de usuario
 * 
 * Incluye información básica del usuario y referencias a sus órdenes
 */
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Por favor ingrese un nombre'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Por favor ingrese un email'],
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            trim: true,
            required: [true, 'Por favor ingrese password'],
        },
        role: {
            type: String,
            enum: ['USER_ROLE', 'ADMIN_ROLE'],
            default: 'USER_ROLE'
        },
        isActive: {
            type: Boolean,
            default: true
        },
        // Añadir configuración de dirección de envío por defecto (opcional)
        defaultShippingAddress: {
            street: String,
            city: String,
            postalCode: String,
            country: String
        }
    },
    {
        timestamps: true,
        // Habilitar virtuals cuando se convierte a JSON u Object
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Campo virtual para acceder a las órdenes del usuario
// No se almacena en la base de datos, pero permite una relación bidireccional
userSchema.virtual('orders', {
    ref: 'Order',           // Modelo a referenciar
    localField: '_id',      // Campo local que se relaciona
    foreignField: 'user'    // Campo en el modelo Order que hace referencia a este modelo
});

const User = mongoose.model('User', userSchema);

export default User;