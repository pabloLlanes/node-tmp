import User from "../models/User.js";
import Product from "../models/Product.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(401).json({ message: "mail or password invalid" })
        }

        const isPasswordCorrect = await bcryptjs.compare(password, user.password)

        if (!isPasswordCorrect) {
            console.log("fail password");
            return res.json({ message: "mail or password invalid" })
        }

        const payload = {
            email: user.email,
            role: user.role
        }

        const signature = process.env.JWT_SECRET;

        const token = jwt.sign(payload, signature, { expiresIn: '48h' })

        console.log(token);

        res.json({ success: true, user, token })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

export const getUsers = async (req, res) => {
    try {
        const users = await User.find().select(['email', 'name', 'role']);

        console.log(users)

        res.json({
            statusOK: true,
            message: "users ok!",
            users: users
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            statusOK: false,
            message: "Error al obtener usuarios"
        })
    }
}

export const createUser = async (req, res) => {
    try {
        console.log(req.user)
        const { name, email, password, role = "user" } = req.body;
        
        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "El email ya está registrado"
            });
        }

        const salt = await bcryptjs.genSalt(10)

        const hashedPassword = await bcryptjs.hash(password, salt);

        const newUser = await User.create({ name, email, password: hashedPassword, role })

        res.status(201).json({
            message: "USUARIO CREADO EXITOSAMENTE",
            user: newUser
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Error al crear el usuario" })
    }
}

export const getUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }

        const products = await Product.find({ creator: userId }).populate('creator');

        res.json({
            statusOK: true,
            message: "user encountered!!",
            user: user,
            productsCreated: products
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            statusOK: false,
            message: "TREMENDO ERROR PARA TRAER UN USER"
        })
    }
}

export const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const updateData = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            {
                new: true,
                runValidators: true,
                context: 'query'
            }
        );

        res.status(200).json({
            statusOK: true,
            message: "User updated successfully.",
            user: updatedUser
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({
            statusOK: false,
            message: "TREMENDO ERROR PARA TRAER UN USER"
        })
    }
}

export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        console.log(userId)

        const user = await User.findByIdAndDelete(userId);

        console.log(user)

        res.json({
            statusOK: true,
            message: "Usuario eliminado correctamente"
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            statusOK: false,
            message: "Error al eliminar el usuario"
        })
    }
}
