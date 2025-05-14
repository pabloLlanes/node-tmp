import mongoose from 'mongoose';

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
        }

    },
    {
        timestamps: true,
    }
);

const User = mongoose.model('User', userSchema);

export default User;