/**
 * ==========================================
 * RUTAS DE USUARIOS (userRouter.js)
 * ==========================================
 * Este archivo define todas las rutas relacionadas con los usuarios.
 * Implementa los endpoints necesarios para la gestión de usuarios,
 * incluyendo consulta, actualización y eliminación.
 * 
 * Incorpora validaciones de datos de entrada y middlewares de seguridad
 * para proteger las rutas sensibles.
 */

// === IMPORTACIONES ===

/**
 * Express Router - Para definir rutas de manera modular
 */
import { Router } from "express";

/**
 * Controladores de usuarios
 * Funciones que manejan la lógica de negocio para cada operación
 */
import {
    getUsers,     // Listar todos los usuarios
    getUser,      // Obtener un usuario específico por ID
    deleteUser,   // Eliminar un usuario
    updateUser    // Actualizar datos de usuario
} from "../controllers/userController.js";

/**
 * Express Validator - Para validar datos de entrada
 * - check: valida campos en el body de la solicitud
 * - param: valida parámetros de ruta (como IDs)
 */
import { check, param } from 'express-validator';

/**
 * Middlewares de la aplicación
 */
// Maneja errores de validación y envía respuestas apropiadas
import { handleValidationErrors } from "../middlewares/validationMiddleware.js";
// Verifica si el usuario solicitado existe y si el usuario autenticado tiene permisos
import { checkUser } from "../middlewares/checkUserMiddleware.js";
// Verifica si el usuario está autenticado mediante token JWT
import { verifyToken } from "../middlewares/verifyToken.js";
// Verifica si el usuario tiene rol de administrador
import { verifyAdminRole } from "../middlewares/verifyAdminRole.js";

/**
 * Creación del enrutador de usuarios
 * Este objeto agrupará todas las rutas relacionadas con usuarios
 */
const userRouter = Router();



/**
 * Ruta: GET /api/users
 * Descripción: Obtiene la lista de todos los usuarios
 * Esta ruta no tiene validaciones porque no recibe parámetros
 * Idealmente debería estar protegida y solo accesible por administradores
 * Respuesta: Array de usuarios o objeto { success, message, users }
 */
userRouter.get("/", getUsers)

/**
 * Ruta: GET /api/users/:id
 * Descripción: Obtiene los datos de un usuario específico por su ID
 * Parámetros de ruta:
 *   - id: ID de MongoDB del usuario a consultar
 * Validaciones:
 *   - ID debe ser un ObjectId válido de MongoDB
 * Middlewares:
 *   - handleValidationErrors: Maneja errores de validación
 *   - checkUser: Verifica si el usuario existe y si tiene permisos para ver la información
 * Respuesta exitosa: { success: true, user }
 * Respuesta error: { success: false, message }
 */
userRouter.get("/:id",
    [
        // Validar que el ID sea un MongoDB ObjectId válido
        param('id', 'El id proporcionado no es de mongodb, fijate bien').isMongoId()
    ],
    // Middleware para manejar errores de validación
    handleValidationErrors,
    // Middleware para verificar existencia del usuario y permisos
    checkUser,
    // Controlador que obtiene y devuelve los datos del usuario
    getUser)

/**
 * Ruta: POST /api/users
 * Descripción: Crea un nuevo usuario en el sistema (exclusivo para administradores)
 * Body: {
 *   name: String (obligatorio),
 *   email: String (obligatorio, debe ser un email válido),
 *   password: String (obligatorio),
 *   role: String (opcional)
 * }
 * Nota: Para el registro normal de usuarios, use /api/auth/register
 * Middlewares:
 *   - verifyToken: Verifica que el usuario esté autenticado
 *   - verifyAdminRole: Verifica que el usuario tenga rol de administrador
 * Seguridad: Solo los administradores pueden crear usuarios por esta ruta
 * Respuesta exitosa: { success: true, user }
 * Respuesta error: { success: false, message }
 */
userRouter.post("/",
    // Middleware para verificar autenticación mediante token JWT
    verifyToken,
    // Middleware para verificar que el usuario tiene rol de administrador
    verifyAdminRole,
    // Controlador que crea el nuevo usuario
    createUser
)

/**
 * Ruta: DELETE /api/users/:id
 * Descripción: Elimina un usuario del sistema
 * Parámetros de ruta:
 *   - id: ID de MongoDB del usuario a eliminar
 * Validaciones:
 *   - ID debe ser un ObjectId válido de MongoDB
 * Middlewares:
 *   - handleValidationErrors: Maneja errores de validación
 *   - verifyToken: Verifica que el solicitante esté autenticado
 *   - verifyAdminRole: Verifica que el solicitante tenga rol de administrador
 * Seguridad: Solo los administradores pueden eliminar usuarios
 * Respuesta exitosa: { success: true, message }
 * Respuesta error: { success: false, message }
 */
userRouter.delete("/:id",
    [
        // Validar que el ID sea un MongoDB ObjectId válido
        param('id', 'El id proporcionado no es de mongodb, fijate bien').isMongoId()
    ],
    // Middleware para manejar errores de validación
    handleValidationErrors,
    // Middleware para verificar autenticación mediante token JWT
    verifyToken,
    // Middleware para verificar que el usuario tiene rol de administrador
    verifyAdminRole,
    // Controlador que elimina el usuario
    deleteUser
)

/**
 * Ruta: PUT /api/users/:id
 * Descripción: Actualiza completamente los datos de un usuario
 * Parámetros de ruta:
 *   - id: ID de MongoDB del usuario a actualizar
 * Body: {
 *   name: String,
 *   email: String,
 *   role: String,
 *   ...otros campos
 * }
 * Validaciones:
 *   - ID debe ser un ObjectId válido de MongoDB
 * Middlewares:
 *   - handleValidationErrors: Maneja errores de validación
 * Nota: Esta ruta debería tener verificación de token y rol o verificación
 * de que el usuario solo pueda modificar sus propios datos, como medida de seguridad.
 * Respuesta exitosa: { success: true, user }
 * Respuesta error: { success: false, message }
 */
userRouter.put("/:id", [
    // Validar que el ID sea un MongoDB ObjectId válido
    param('id', 'El id proporcionado no es de mongodb, fijate bien').isMongoId()
],
    // Middleware para manejar errores de validación
    handleValidationErrors,
    // Middleware para verificar autenticación mediante token JWT
    verifyToken,
    // Controlador que actualiza el usuario
    updateUser
)

/**
 * Exportación del router de usuarios
 * Este router será montado en app.js en la ruta base /api/users
 */
export default userRouter;