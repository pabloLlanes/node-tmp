/**
 * ==========================================
 * RUTAS DE PRODUCTOS (productRouter.js)
 * ==========================================
 * Este archivo define todas las rutas relacionadas con los productos.
 * Implementa el patrón REST para los endpoints de la API, incluyendo:
 * - Listado con paginación
 * - Búsqueda y filtrado
 * - CRUD completo (Crear, Leer, Actualizar, Eliminar)
 * - Subida de imágenes
 * 
 * Cada ruta incluye validaciones utilizando express-validator.
 */

// === IMPORTACIONES ===

/**
 * Express Router - Para definir rutas de manera modular
 */
import { Router } from "express";

/**
 * Express Validator - Para validar datos de entrada en solicitudes
 * - check: valida campos en el body de la solicitud
 * - param: valida parámetros de ruta (como IDs)
 */
import { check, param } from 'express-validator';

/**
 * Middleware personalizado para manejar errores de validación
 * Este middleware se ejecuta después de las validaciones para verificar
 * si hubo errores y responder apropiadamente
 */
import { handleValidationErrors } from "../middlewares/validationMiddleware.js";

/**
 * Controladores de productos
 * Estos controladores contienen la lógica de negocio para cada operación
 */
import { 
    getProducts,           // Listar productos con paginación
    getProductById,        // Obtener un producto por ID
    createProduct,         // Crear un producto nuevo
    updateProduct,         // Actualizar un producto (PUT - reemplazo completo)
    deleteProduct,         // Eliminar un producto
    searchProducts,        // Buscar productos por texto
    filterProducts,        // Filtrar productos por criterios
    patchProduct,          // Actualizar parcialmente un producto (PATCH)
    uploadProductImage     // Subir imagen para un producto
} from "../controllers/productController.js";

/**
 * Configuración de Multer para subida de archivos
 * Multer es un middleware que maneja formularios multipart/form-data,
 * necesario para la subida de imágenes
 */
import upload from '../config/multer.js';

/**
 * Creación del enrutador de productos
 * Este objeto agrupará todas las rutas relacionadas con productos
 */
const productRouter = Router();

/**
 * Ruta: GET /api/products
 * Descripción: Obtener listado paginado de productos
 * Query params: 
 *   - page: Número de página (default: 1)
 *   - limit: Elementos por página (default: 10)
 * Respuesta: { success, count, total, totalPages, currentPage, products }
 */
productRouter.get("/", getProducts);

/**
 * Ruta: GET /api/products/search
 * Descripción: Buscar productos por texto en nombre o descripción
 * Query params: 
 *   - search: Término de búsqueda (obligatorio)
 *   - page: Número de página (default: 1)
 *   - limit: Elementos por página (default: 10)
 * Respuesta: { success, count, total, totalPages, currentPage, products }
 */
productRouter.get("/search", searchProducts);

/**
 * Ruta: GET /api/products/filter
 * Descripción: Filtrar productos por precio y disponibilidad
 * Query params: 
 *   - minPrice: Precio mínimo (opcional)
 *   - maxPrice: Precio máximo (opcional)
 *   - isAvailable: Disponibilidad (true/false, opcional)
 *   - page: Número de página (default: 1)
 *   - limit: Elementos por página (default: 10)
 * Respuesta: { success, count, total, totalPages, currentPage, products }
 */
productRouter.get("/filter", filterProducts);

/**
 * Ruta: GET /api/products/:id
 * Descripción: Obtener un producto específico por su ID
 * Parámetros de ruta:
 *   - id: ID de MongoDB del producto a consultar
 * Validaciones:
 *   - ID debe ser un ObjectId válido de MongoDB
 * Respuesta: { success, product }
 */
productRouter.get("/:id", [
    // Validar que el ID sea un MongoDB ObjectId válido
    param('id').isMongoId().withMessage('ID de producto no válido'),
    // Middleware que verifica si hubo errores de validación y responde apropiadamente
    handleValidationErrors
], getProductById);

/**
 * Ruta: POST /api/products
 * Descripción: Crear un nuevo producto en la base de datos
 * Body: {
 *   name: String (obligatorio),
 *   price: Number,
 *   description: String,
 *   category: ObjectId,
 *   available: Boolean,
 *   stock: Number,
 *   image: String (URL)
 * }
 * Validaciones:
 *   - name es obligatorio y no puede estar vacío
 * Respuesta: { success, product }
 */
productRouter.post("/", [
    // Validar que el nombre del producto esté presente y no vacío
    check('name').notEmpty().withMessage('El nombre del producto es obligatorio'),
    // Manejo de errores de validación
    handleValidationErrors
], createProduct);

/**
 * Ruta: PUT /api/products/:id
 * Descripción: Actualizar completamente un producto existente (reemplazo total)
 * Parámetros de ruta:
 *   - id: ID de MongoDB del producto a actualizar
 * Body: {
 *   name: String,
 *   price: Number,
 *   description: String,
 *   category: ObjectId,
 *   available: Boolean,
 *   stock: Number,
 *   image: String (URL)
 * }
 * Validaciones:
 *   - ID debe ser un ObjectId válido de MongoDB
 *   - Si name está presente, no puede estar vacío
 * Respuesta: { success, product }
 */
productRouter.put("/:id", [
    // Validar que el ID sea un MongoDB ObjectId válido
    param('id').isMongoId().withMessage('ID de producto no válido'),
    // Si se proporciona un nombre, verificar que no esté vacío
    check('name').optional().notEmpty().withMessage('El nombre no puede estar vacío'),
    // Manejo de errores de validación
    handleValidationErrors
], updateProduct);

/**
 * Ruta: PATCH /api/products/:id
 * Descripción: Actualizar parcialmente un producto (solo los campos enviados)
 * Parámetros de ruta:
 *   - id: ID de MongoDB del producto a actualizar parcialmente
 * Body: Cualquier combinación de campos del producto a actualizar
 * Validaciones:
 *   - ID debe ser un ObjectId válido de MongoDB
 * Respuesta: { success, message, product }
 * 
 * Diferencia con PUT: PATCH actualiza solo los campos enviados,
 * mientras que PUT reemplaza el objeto completo.
 */
productRouter.patch("/:id", [
    // Validar que el ID sea un MongoDB ObjectId válido
    param('id').isMongoId().withMessage('ID de producto no válido'),
    // Manejo de errores de validación
    handleValidationErrors
], patchProduct);

/**
 * Ruta: DELETE /api/products/:id
 * Descripción: Eliminar un producto de la base de datos
 * Parámetros de ruta:
 *   - id: ID de MongoDB del producto a eliminar
 * Validaciones:
 *   - ID debe ser un ObjectId válido de MongoDB
 * Respuesta: { success, message }
 */
productRouter.delete("/:id", [
    // Validar que el ID sea un MongoDB ObjectId válido
    param('id').isMongoId().withMessage('ID de producto no válido'),
    // Manejo de errores de validación
    handleValidationErrors
], deleteProduct);

/**
 * Ruta: POST /api/products/:id/upload-image
 * Descripción: Subir una imagen para un producto específico
 * Parámetros de ruta:
 *   - id: ID de MongoDB del producto
 * Body: Formulario multipart/form-data con un campo 'image' que contiene el archivo
 * Middlewares:
 *   - Validación del ID
 *   - Multer para procesar el archivo subido (upload.single)
 * Respuesta: { success, message, product, imageUrl, file }
 */
productRouter.post("/:id/upload-image", [
    // Validar que el ID sea un MongoDB ObjectId válido
    param('id').isMongoId().withMessage('ID de producto no válido'),
    // Manejo de errores de validación
    handleValidationErrors
], 
    // Middleware de Multer que procesa un único archivo con el nombre de campo 'image'
    upload.single('image'), 
    // Controlador que maneja la lógica después de que el archivo ha sido procesado
    uploadProductImage
);

/**
 * Exportación del router de productos
 * Este router será montado en app.js en la ruta base /api/products
 */
export default productRouter;