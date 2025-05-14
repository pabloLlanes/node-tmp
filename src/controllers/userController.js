import User from "../models/User.js";
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
        res.json({ success: true, message: error })
    }

}


export const getUsers = async (req, res) => {
    try {
        //consulta a la db

        const users = await User.find().select(['email', 'name', 'role']);
        //const users = await User.find().select('-password');

        console.log(users)

        //respuesta
        res.json({
            statusOK: true,
            message: "users ok!",
            users: users
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            statusOK: false,
            message: "TREMENDO ERROR"
        })
    }
}

export const createUser = async (req, res) => {
    try {
        console.log(req.user)
        const { name, email, password, role } = req.body;

        console.log(password)

        const salt = await bcryptjs.genSalt(10)

        const hashedPassword = await bcryptjs.hash(password, salt);

        const newUser = await User.create({ name, email, password: hashedPassword, role })

        res.status(201).json({
            message: "USUARIO CREADO EXITOSAMENTE",
            user: newUser
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: true, message: "TREMENDO ERROR CREANDO EL USUARIO" })
    }
}

export const getUser = async (req, res) => {
    try {

        const userId = req.params.id;

        console.log(userId)

        const user = await User.findById(userId);

        if (!user) {
            res.json({ message: "CHE USUARIO NO ENCONTRADO, pasame un id valido" })
        }

        console.log(user)

        //respuesta
        res.json({
            statusOK: true,
            message: "user encountered!!",
            user: user
        })

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

        //respuesta
        res.json({
            statusOK: true,
            message: "user borrado!!"

        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            statusOK: false,
            message: "TREMENDO ERROR PARA TRAER UN USER"
        })
    }
}
