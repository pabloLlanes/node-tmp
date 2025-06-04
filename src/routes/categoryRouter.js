/**
 * ==========================================
 * RUTAS DE CATEGORÍAS (categoryRouter.js)
 * ==========================================
 * Este archivo define todas las rutas relacionadas con las categorías de productos.
 * Implementa el patrón REST para los endpoints de la API, incluyendo:
 * - Listado de categorías
 * - Consulta por ID
 * - Consulta de productos por categoría
 * - CRUD completo (Crear, Leer, Actualizar, Eliminar)
 * 
 * Cada ruta incluye validaciones utilizando express-validator.
 */

// === IMPORTACIONES ===

/**
 * Express Router - Para definir rutas de manera modular
 */
import { Router } from "express";

/**
 * Express Validator - Para validar datos de entrada
 * - check: valida campos en el body de la solicitud
 * - param: valida parámetros de ruta (como IDs)
 */
import { check, param } from 'express-validator';

/**
 * Middleware para manejar errores de validación
 * Se ejecuta después de las validaciones para verificar si hubo errores
 * y responder apropiadamente
 */
import { handleValidationErrors } from "../middlewares/validationMiddleware.js";

/**
 * Middleware de autenticación
 * Verifica si el usuario está autenticado mediante token JWT
 */
import { verifyToken } from "../middlewares/verifyToken.js";

/**
 * Controladores de categorías
 * Estos controladores contienen la lógica de negocio para cada operación
 */
import { 
    getCategories,          // Listar todas las categorías
    getCategoryById,        // Obtener una categoría por ID
    createCategory,         // Crear una nueva categoría
    updateCategory,         // Actualizar completamente una categoría (PUT)
    patchCategory,          // Actualizar parcialmente una categoría (PATCH)
    deleteCategory,         // Eliminar una categoría
    getProductsByCategory   // Obtener productos que pertenecen a una categoría
} from "../controllers/categoryController.js";

/**
 * Creación del enrutador de categorías
 * Este objeto agrupará todas las rutas relacionadas con categorías
 */
const categoryRouter = Router();

/**
 * Ruta: GET /api/categories
 * Descripción: Obtiene la lista de todas las categorías disponibles
 * No recibe parámetros en la URL ni en el body
 * Puede incluir paginación dependiendo de la implementación del controlador
 * Respuesta: { success, count, categories }
 */
categoryRouter.get("/", getCategories);

/**
 * Ruta: GET /api/categories/:id
 * Descripción: Obtiene una categoría específica por su ID
 * Parámetros de ruta:
 *   - id: ID de MongoDB de la categoría a consultar
 * Validaciones:
 *   - ID debe ser un ObjectId válido de MongoDB
 * Respuesta: { success, category }
 */
categoryRouter.get("/:id", [
    // Validar que el ID sea un MongoDB ObjectId válido
    param('id').isMongoId().withMessage('ID de categoría no válido'),
    // Middleware para manejar errores de validación
    handleValidationErrors
], getCategoryById);

/**
 * Ruta: GET /api/categories/:id/products
 * Descripción: Obtiene todos los productos que pertenecen a una categoría específica
 * Parámetros de ruta:
 *   - id: ID de MongoDB de la categoría cuyos productos se quieren obtener
 * Query params (posibles, dependiendo de la implementación del controlador):
 *   - page: Número de página (paginación)
 *   - limit: Elementos por página
 * Validaciones:
 *   - ID debe ser un ObjectId válido de MongoDB
 * Respuesta: { success, count, products }
 */
categoryRouter.get("/:id/products", [
    // Validar que el ID sea un MongoDB ObjectId válido
    param('id').isMongoId().withMessage('ID de categoría no válido'),
    // Middleware para manejar errores de validación
    handleValidationErrors
], getProductsByCategory);

/**
 * Ruta: POST /api/categories
 * Descripción: Crea una nueva categoría en la base de datos
 * Body: {
 *   name: String (obligatorio),
 *   description: String (opcional)
 * }
 * Validaciones:
 *   - name es obligatorio y no puede estar vacío
 * Respuesta: { success, category }
 * 
 * Nota: Dependiendo de los requisitos de seguridad, esta ruta
 * podría requerir middleware de autenticación y verificación de rol.
 */
categoryRouter.post("/", [
    // Validar que el nombre de la categoría esté presente y no vacío
    check('name').notEmpty().withMessage('El nombre de la categoría es obligatorio'),
    // Middleware para manejar errores de validación
    handleValidationErrors,
    // Middleware de autenticación - verifica que el usuario esté autenticado
    verifyToken
], createCategory);

/**
 * Ruta: PUT /api/categories/:id
 * Descripción: Actualiza completamente una categoría existente (reemplazo total)
 * Parámetros de ruta:
 *   - id: ID de MongoDB de la categoría a actualizar
 * Body: {
 *   name: String (obligatorio),
 *   description: String (opcional),
 *   otros campos según el modelo...
 * }
 * Validaciones:
 *   - ID debe ser un ObjectId válido de MongoDB
 *   - name es obligatorio y no puede estar vacío
 * Respuesta: { success, category }
 */
categoryRouter.put("/:id", [
    // Validar que el ID sea un MongoDB ObjectId válido
    param('id').isMongoId().withMessage('ID de categoría no válido'),
    // Validar que el nombre de la categoría esté presente y no vacío
    check('name').notEmpty().withMessage('El nombre de la categoría es obligatorio'),
    // Middleware para manejar errores de validación
    handleValidationErrors,
    // Middleware de autenticación - verifica que el usuario esté autenticado
    verifyToken
], updateCategory);

/**
 * Ruta: PATCH /api/categories/:id
 * Descripción: Actualiza parcialmente una categoría (solo los campos enviados)
 * Parámetros de ruta:
 *   - id: ID de MongoDB de la categoría a actualizar parcialmente
 * Body: Cualquier combinación de campos del modelo de categoría a actualizar
 * Validaciones:
 *   - ID debe ser un ObjectId válido de MongoDB
 * Respuesta: { success, message, category }
 * 
 * Diferencia con PUT: PATCH actualiza solo los campos enviados,
 * mientras que PUT reemplaza el objeto completo.
 */
categoryRouter.patch("/:id", [
    // Validar que el ID sea un MongoDB ObjectId válido
    param('id').isMongoId().withMessage('ID de categoría no válido'),
    // Middleware para manejar errores de validación
    handleValidationErrors,
    // Middleware de autenticación - verifica que el usuario esté autenticado
    verifyToken
], patchCategory);

/**
 * Ruta: DELETE /api/categories/:id
 * Descripción: Elimina una categoría de la base de datos
 * Parámetros de ruta:
 *   - id: ID de MongoDB de la categoría a eliminar
 * Validaciones:
 *   - ID debe ser un ObjectId válido de MongoDB
 * Respuesta: { success, message }
 * 
 * Precaución: La eliminación de una categoría podría afectar a los productos
 * asociados a ella. El controlador debería manejar esta situación adecuadamente.
 */
categoryRouter.delete("/:id", [
    // Validar que el ID sea un MongoDB ObjectId válido
    param('id').isMongoId().withMessage('ID de categoría no válido'),
    // Middleware para manejar errores de validación
    handleValidationErrors,
    // Middleware de autenticación - verifica que el usuario esté autenticado
    verifyToken
], deleteCategory);

/**
 * Exportación del router de categorías
 * Este router será montado en app.js en la ruta base /api/categories
 */
export default categoryRouter;
