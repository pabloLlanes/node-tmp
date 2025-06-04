/**
 * ==========================================
 * RUTAS DE RELACIONES (relationRouter.js)
 * ==========================================
 * Este archivo define rutas específicas para establecer y gestionar relaciones
 * entre las diferentes entidades del sistema (usuarios, productos, categorías, etc.)
 * 
 * Estas rutas facilitan la asignación de relaciones como:
 * - Asignar un creador a un producto
 * - Asignar una categoría a un producto
 * - Asignar productos a una categoría en lote
 * 
 * Cada ruta incluye validaciones y autorizaciones apropiadas.
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
 * Middleware de autenticación y autorización
 * Verifica que el usuario esté autenticado y tenga los permisos necesarios
 */
import { verifyToken } from "../middlewares/verifyToken.js";

/**
 * Modelos - Necesarios para realizar las operaciones de vinculación
 */
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import User from "../models/User.js";

/**
 * Creación del enrutador de relaciones
 * Este objeto agrupará todas las rutas relacionadas con la gestión de relaciones
 */
const relationRouter = Router();

/**
 * Middleware común para todas las rutas de relaciones
 * Exige que el usuario esté autenticado para todas las operaciones
 */
relationRouter.use(verifyToken);

/**
 * ==========================================
 * RELACIONES PRODUCTO-USUARIO
 * ==========================================
 */

/**
 * Ruta: POST /api/relations/products/:productId/creator
 * Descripción: Asigna un usuario como creador de un producto
 * Parámetros de ruta:
 *   - productId: ID de MongoDB del producto a modificar
 * Body: 
 *   - userId: ID del usuario a asignar como creador (opcional, por defecto el usuario autenticado)
 * Validaciones:
 *   - productId debe ser un ObjectId válido de MongoDB
 *   - userId (si se proporciona) debe ser un ObjectId válido de MongoDB
 * Respuesta: { success, message, product }
 * 
 * Permisos: Solo el propietario actual o administradores pueden cambiar el creador
 */
relationRouter.post("/products/:productId/creator", [
    // Validar que el ID del producto sea un MongoDB ObjectId válido
    param('productId').isMongoId().withMessage('ID de producto no válido'),
    // Si se proporciona un userId, validar que sea un MongoDB ObjectId válido
    check('userId').optional().isMongoId().withMessage('ID de usuario no válido'),
    // Middleware para manejar errores de validación
    handleValidationErrors
], async (req, res) => {
    try {
        const { productId } = req.params;
        // Si no se proporciona userId, usa el ID del usuario autenticado
        const userId = req.body.userId || req.user._id;

        // 1. Verificar que el producto existe
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: 'Producto no encontrado' 
            });
        }

        // 2. Verificar permisos (solo admin o el creador actual pueden cambiar esto)
        if (product.creator && 
            product.creator.toString() !== req.user._id.toString() && 
            req.user.role !== 'ADMIN_ROLE') {
            return res.status(403).json({ 
                success: false, 
                message: 'No tienes permiso para cambiar el creador de este producto' 
            });
        }

        // 3. Verificar que el usuario a asignar existe
        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuario no encontrado' 
            });
        }

        // 4. Asignar el creador al producto
        product.creator = userId;
        await product.save();

        // 5. Respuesta exitosa
        res.json({ 
            success: true, 
            message: 'Creador asignado correctamente al producto',
            product
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al asignar creador al producto', 
            error: error.message 
        });
    }
});

/**
 * ==========================================
 * RELACIONES PRODUCTO-CATEGORÍA
 * ==========================================
 */

/**
 * Ruta: POST /api/relations/products/:productId/category
 * Descripción: Asigna una categoría a un producto
 * Parámetros de ruta:
 *   - productId: ID de MongoDB del producto a modificar
 * Body: 
 *   - categoryId: ID de la categoría a asignar al producto
 * Validaciones:
 *   - productId debe ser un ObjectId válido de MongoDB
 *   - categoryId debe ser un ObjectId válido de MongoDB
 * Respuesta: { success, message, product }
 * 
 * Permisos: Solo el creador del producto o administradores pueden cambiar la categoría
 */
relationRouter.post("/products/:productId/category", [
    // Validar que el ID del producto sea un MongoDB ObjectId válido
    param('productId').isMongoId().withMessage('ID de producto no válido'),
    // Validar que se proporcione un ID de categoría
    check('categoryId').isMongoId().withMessage('ID de categoría no válido'),
    // Middleware para manejar errores de validación
    handleValidationErrors
], async (req, res) => {
    try {
        const { productId } = req.params;
        const { categoryId } = req.body;

        // 1. Verificar que el producto existe
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: 'Producto no encontrado' 
            });
        }

        // 2. Verificar permisos (solo admin o el creador pueden cambiar esto)
        if (product.creator && 
            product.creator.toString() !== req.user._id.toString() && 
            req.user.role !== 'ADMIN_ROLE') {
            return res.status(403).json({ 
                success: false, 
                message: 'No tienes permiso para cambiar la categoría de este producto' 
            });
        }

        // 3. Verificar que la categoría existe
        const categoryExists = await Category.findById(categoryId);
        if (!categoryExists) {
            return res.status(404).json({ 
                success: false, 
                message: 'Categoría no encontrada' 
            });
        }

        // 4. Asignar la categoría al producto
        product.category = categoryId;
        await product.save();

        // 5. Respuesta exitosa
        res.json({ 
            success: true, 
            message: 'Categoría asignada correctamente al producto',
            product
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al asignar categoría al producto', 
            error: error.message 
        });
    }
});

/**
 * Ruta: POST /api/relations/categories/:categoryId/products
 * Descripción: Asigna múltiples productos a una categoría en una sola operación
 * Parámetros de ruta:
 *   - categoryId: ID de MongoDB de la categoría
 * Body: 
 *   - productIds: Array de IDs de productos a asignar a la categoría
 * Validaciones:
 *   - categoryId debe ser un ObjectId válido de MongoDB
 *   - productIds debe ser un array no vacío de ObjectIds válidos
 * Respuesta: { success, message, updatedCount, products }
 * 
 * Permisos: Solo administradores pueden realizar esta operación en lote
 */
relationRouter.post("/categories/:categoryId/products", [
    // Validar que el ID de la categoría sea un MongoDB ObjectId válido
    param('categoryId').isMongoId().withMessage('ID de categoría no válido'),
    // Validar que se proporcione un array de IDs de productos
    check('productIds').isArray({ min: 1 }).withMessage('Se requiere al menos un ID de producto'),
    check('productIds.*').isMongoId().withMessage('Todos los IDs de productos deben ser válidos'),
    // Middleware para manejar errores de validación
    handleValidationErrors
], async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { productIds } = req.body;

        // 1. Verificar que el usuario sea administrador
        if (req.user.role !== 'ADMIN_ROLE') {
            return res.status(403).json({ 
                success: false, 
                message: 'Solo los administradores pueden asignar múltiples productos a una categoría' 
            });
        }

        // 2. Verificar que la categoría existe
        const categoryExists = await Category.findById(categoryId);
        if (!categoryExists) {
            return res.status(404).json({ 
                success: false, 
                message: 'Categoría no encontrada' 
            });
        }

        // 3. Actualizar todos los productos especificados
        const updateResult = await Product.updateMany(
            { _id: { $in: productIds } },
            { category: categoryId }
        );

        // 4. Obtener los productos actualizados
        const updatedProducts = await Product.find({ _id: { $in: productIds } });

        // 5. Respuesta exitosa
        res.json({ 
            success: true, 
            message: 'Productos asignados correctamente a la categoría',
            updatedCount: updateResult.modifiedCount,
            products: updatedProducts
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al asignar productos a la categoría', 
            error: error.message 
        });
    }
});

/**
 * ==========================================
 * ENDPOINTS DE CONSULTA DE RELACIONES
 * ==========================================
 */

/**
 * Ruta: GET /api/relations/users/:userId/products
 * Descripción: Obtiene todos los productos creados por un usuario específico
 * Parámetros de ruta:
 *   - userId: ID de MongoDB del usuario
 * Query params: 
 *   - page: Número de página (paginación)
 *   - limit: Elementos por página
 * Validaciones:
 *   - userId debe ser un ObjectId válido de MongoDB
 * Respuesta: { success, count, total, products }
 */
relationRouter.get("/users/:userId/products", [
    // Validar que el ID del usuario sea un MongoDB ObjectId válido
    param('userId').isMongoId().withMessage('ID de usuario no válido'),
    // Middleware para manejar errores de validación
    handleValidationErrors
], async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Parámetros de paginación
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // 1. Verificar que el usuario existe
        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuario no encontrado' 
            });
        }

        // 2. Buscar productos creados por el usuario
        const products = await Product.find({ creator: userId })
            .populate('category')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        // 3. Contar total de productos del usuario
        const total = await Product.countDocuments({ creator: userId });

        // 4. Respuesta exitosa
        res.json({ 
            success: true, 
            count: products.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            products
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener productos del usuario', 
            error: error.message 
        });
    }
});

/**
 * Exportación del router de relaciones
 * Este router será montado en app.js en la ruta base /api/relations
 */
export default relationRouter;
