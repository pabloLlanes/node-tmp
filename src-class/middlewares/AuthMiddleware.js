import jwt from 'jsonwebtoken';
import User from '../models/UserModel.js';

export class AuthMiddleware {
    static async verifyToken(req, res, next) {
        try {
            // Obtener el token del header
            const token = req.header('x-auth-token');
            
            // Verificar si no hay token
            if (!token) {
                return res.status(401).json({
                    success: false,
                    msg: 'No hay token, autorización denegada'
                });
            }
            
            // Verificar el token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Añadir el usuario al request
            const user = await User.findById(decoded.id).select('-password');
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    msg: 'Usuario no encontrado'
                });
            }
            
            req.user = user;
            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({
                success: false,
                msg: 'Token no válido'
            });
        }
    }
    
    static verifyAdminRole(req, res, next) {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                msg: 'No hay usuario autenticado'
            });
        }
        
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                msg: 'Se requiere rol de administrador para esta operación'
            });
        }
        
        next();
    }
    
    static async checkUserExists(req, res, next) {
        try {
            const userId = req.params.id;
            
            // Verificar si el ID es válido
            if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
                return res.status(400).json({
                    success: false, 
                    msg: 'ID de usuario no válido'
                });
            }
            
            // Buscar el usuario
            const user = await User.findById(userId);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    msg: 'Usuario no encontrado'
                });
            }
            
            // Añadir el usuario encontrado al request para uso posterior
            req.foundUser = user;
            next();
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                msg: 'Error del servidor al buscar usuario'
            });
        }
    }
}
