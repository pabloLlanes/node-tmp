/**
 * ==========================================
 * RUTAS DE AUTENTICACIÓN (authRouter.js)
 * ==========================================
 * Este archivo define todas las rutas relacionadas con la autenticación.
 * Implementa los endpoints necesarios para login y registro de usuarios.
 * 
 * Incorpora validaciones de datos de entrada para asegurar la integridad
 * de la información recibida.
 */

// === IMPORTACIONES ===

/**
 * Express Router - Para definir rutas de manera modular
 */
import { Router } from "express";

/**
 * Controladores de autenticación
 * Funciones que manejan la lógica de negocio para cada operación
 */
import {
    login,         // Autenticar un usuario y generar token
    createUser     // Registrar un nuevo usuario
} from "../controllers/userController.js";

/**
 * Express Validator - Para validar datos de entrada
 * - check: valida campos en el body de la solicitud
 */
import { check } from 'express-validator';

/**
 * Middlewares de la aplicación
 */
// Maneja errores de validación y envía respuestas apropiadas
import { handleValidationErrors } from "../middlewares/validationMiddleware.js";

/**
 * Creación del enrutador de autenticación
 * Este objeto agrupará todas las rutas relacionadas con autenticación
 */
const authRouter = Router();

/**
 * Ruta: POST /api/auth/login
 * Descripción: Autentica un usuario y genera un token JWT
 * Body: {
 *   email: String (obligatorio, debe ser un email válido),
 *   password: String (obligatorio)
 * }
 * Validaciones:
 *   - email debe ser un correo electrónico válido
 *   - password no puede estar vacío
 * Middlewares:
 *   - express-validator para validar los campos de entrada
 *   - handleValidationErrors para gestionar errores de validación
 * Respuesta exitosa: { token, user }
 * Respuesta error: { success: false, message }
 */
authRouter.post("/login",
    [
        // Validar que el email sea válido y normalizarlo (convertir a minúsculas, etc.)
        check('email', 'El email es obligatorio | EV').isEmail().normalizeEmail(),
        // Validar que el password esté presente
        check('password', 'El password es obligatorio | EV').not().isEmpty()
    ],
    // Middleware para manejar errores de validación
    handleValidationErrors,
    // Controlador que maneja la lógica de autenticación
    login
);

/**
 * Ruta: POST /api/auth/register
 * Descripción: Registra un nuevo usuario en el sistema sin requerir token
 * Body: {
 *   name: String (obligatorio),
 *   email: String (obligatorio, debe ser un email válido),
 *   password: String (obligatorio)
 * }
 * Validaciones:
 *   - name no puede estar vacío
 *   - email debe ser un correo electrónico válido
 *   - password no puede estar vacío
 * Middlewares:
 *   - handleValidationErrors: Maneja errores de validación
 * Respuesta exitosa: { success: true, user }
 * Respuesta error: { success: false, message }
 */
authRouter.post("/register",
    [
        // Validar que el nombre esté presente y eliminar espacios en blanco
        check('name', 'El nombre es obligatorio | EV').not().isEmpty().trim(),
        // Validar que el email sea válido y normalizarlo
        check('email', 'El email es obligatorio | EV').isEmail().normalizeEmail(),
        // Validar que el password esté presente
        check('password', 'El password es obligatorio | EV').not().isEmpty()
    ],
    // Middleware para manejar errores de validación
    handleValidationErrors,
    // Controlador que crea el nuevo usuario
    createUser
);

/**
 * Exportación del router de autenticación
 * Este router será montado en app.js en la ruta base /api/auth
 */
export default authRouter;
