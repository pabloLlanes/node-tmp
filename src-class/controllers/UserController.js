import BaseController from './BaseController.js';
import User from '../models/UserModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class UserController extends BaseController {
    constructor() {
        super(User);
    }

    async getUsers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const users = await User.find()
                .select('-password')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            const total = await User.countDocuments();

            return res.json({
                success: true,
                count: users.length,
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                users
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener usuarios',
                error: error.message
            });
        }
    }

    async getUser(req, res) {
        try {
            // El middleware checkUser ya ha verificado que el usuario existe
            // y lo ha añadido a req.foundUser
            const user = req.foundUser;
            
            // No devolver la contraseña
            const userResponse = {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };
            
            return res.json({
                success: true,
                user: userResponse
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener usuario',
                error: error.message
            });
        }
    }

    async createUser(req, res) {
        try {
            const { username, email, password, role } = req.body;
            
            // Verificar si el usuario ya existe
            const existingUser = await User.findOne({ $or: [{ email }, { username }] });
            
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: existingUser.email === email 
                        ? 'El email ya está registrado' 
                        : 'El nombre de usuario ya está en uso'
                });
            }
            
            // Encriptar contraseña
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            // Crear nuevo usuario
            const newUser = await User.create({
                username,
                email,
                password: hashedPassword,
                role: role || 'user' // Por defecto es 'user' si no se especifica
            });
            
            // No devolver la contraseña en la respuesta
            const userResponse = {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                createdAt: newUser.createdAt
            };
            
            return res.status(201).json({
                success: true,
                message: 'Usuario creado exitosamente',
                user: userResponse
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'Error al crear usuario',
                error: error.message
            });
        }
    }

    async updateUser(req, res) {
        try {
            const userId = req.params.id;
            const { username, email, password, role } = req.body;
            
            // Verificar si el usuario puede editar (solo el propio usuario o admin)
            if (userId !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permiso para editar este usuario'
                });
            }
            
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }
            
            // Preparar los datos a actualizar
            const updateData = {};
            
            if (username) {
                // Verificar si el nuevo username ya está en uso
                const existingUsername = await User.findOne({ 
                    username, 
                    _id: { $ne: userId } 
                });
                
                if (existingUsername) {
                    return res.status(400).json({
                        success: false,
                        message: 'El nombre de usuario ya está en uso'
                    });
                }
                
                updateData.username = username;
            }
            
            if (email) {
                // Verificar si el nuevo email ya está en uso
                const existingEmail = await User.findOne({ 
                    email, 
                    _id: { $ne: userId } 
                });
                
                if (existingEmail) {
                    return res.status(400).json({
                        success: false,
                        message: 'El email ya está registrado'
                    });
                }
                
                updateData.email = email;
            }
            
            if (password) {
                // Encriptar la nueva contraseña
                const salt = await bcrypt.genSalt(10);
                updateData.password = await bcrypt.hash(password, salt);
            }
            
            // Solo el admin puede cambiar roles
            if (role && req.user.role === 'admin') {
                updateData.role = role;
            }
            
            // Actualizar usuario
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                updateData,
                { new: true, runValidators: true }
            ).select('-password');
            
            return res.json({
                success: true,
                message: 'Usuario actualizado exitosamente',
                user: updatedUser
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'Error al actualizar usuario',
                error: error.message
            });
        }
    }

    async deleteUser(req, res) {
        try {
            const userId = req.params.id;
            
            // Verificar permisos (solo admin puede eliminar usuarios)
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permiso para eliminar usuarios'
                });
            }
            
            const deletedUser = await User.findByIdAndDelete(userId);
            
            if (!deletedUser) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }
            
            return res.json({
                success: true,
                message: 'Usuario eliminado exitosamente',
                user: {
                    _id: deletedUser._id,
                    username: deletedUser.username,
                    email: deletedUser.email
                }
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'Error al eliminar usuario',
                error: error.message
            });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            
            // Buscar usuario por email
            const user = await User.findOne({ email });
            
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }
            
            // Verificar contraseña
            const isMatch = await bcrypt.compare(password, user.password);
            
            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }
            
            // Generar JWT
            const payload = {
                id: user._id,
                role: user.role
            };
            
            jwt.sign(
                payload, 
                process.env.JWT_SECRET, 
                { expiresIn: '24h' }, 
                (err, token) => {
                    if (err) throw err;
                    
                    res.json({
                        success: true,
                        token,
                        user: {
                            _id: user._id,
                            username: user.username,
                            email: user.email,
                            role: user.role
                        }
                    });
                }
            );
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'Error en el inicio de sesión',
                error: error.message
            });
        }
    }
}
