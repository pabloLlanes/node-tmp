import BaseRouter from './BaseRouter.js';
import { ProductController } from '../controllers/ProductController.js';
import { check, param, query } from 'express-validator';
import { ValidationMiddleware } from '../middlewares/ValidationMiddleware.js';
import { AuthMiddleware } from '../middlewares/AuthMiddleware.js';

export class ProductRouter extends BaseRouter {
    constructor() {
        super();
        this.controller = new ProductController();
        this.setupRoutes();
    }
    
    initializeRoutes() {
        // Obtener todos los productos con filtrado opcional
        this.router.get('/',
            [
                query('category').optional().isMongoId().withMessage('ID de categoría inválido'),
                query('available').optional().isBoolean().withMessage('El valor de disponibilidad debe ser true/false'),
                query('page').optional().isInt({ min: 1 }).withMessage('La página debe ser un entero positivo'),
                query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('El límite debe estar entre 1 y 100')
            ],
            ValidationMiddleware.handleValidationErrors,
            this.controller.getProducts.bind(this.controller)
        );
        
        // Buscar productos
        this.router.get('/search',
            [
                query('term').not().isEmpty().withMessage('El término de búsqueda es requerido')
            ],
            ValidationMiddleware.handleValidationErrors,
            this.controller.searchProducts.bind(this.controller)
        );
        
        // Obtener producto por ID
        this.router.get('/:id',
            [
                param('id', 'ID de producto no válido').isMongoId()
            ],
            ValidationMiddleware.handleValidationErrors,
            this.controller.getProduct.bind(this.controller)
        );
        
        // Crear producto (requiere autenticación)
        this.router.post('/',
            AuthMiddleware.verifyToken,
            this.controller.getUploader(),
            [
                check('name', 'El nombre es obligatorio').not().isEmpty().trim(),
                check('price', 'El precio debe ser un número positivo').optional().isFloat({ min: 0 }),
                check('stock', 'El stock debe ser un número entero positivo').optional().isInt({ min: 0 }),
                check('category').optional().isMongoId().withMessage('ID de categoría inválido')
            ],
            ValidationMiddleware.handleValidationErrors,
            this.controller.createProduct.bind(this.controller)
        );
        
        // Actualizar producto (requiere autenticación)
        this.router.put('/:id',
            [
                param('id', 'ID de producto no válido').isMongoId()
            ],
            AuthMiddleware.verifyToken,
            this.controller.getUploader(),
            ValidationMiddleware.handleValidationErrors,
            this.controller.updateProduct.bind(this.controller)
        );
        
        // Eliminar producto (requiere autenticación)
        this.router.delete('/:id',
            [
                param('id', 'ID de producto no válido').isMongoId()
            ],
            ValidationMiddleware.handleValidationErrors,
            AuthMiddleware.verifyToken,
            this.controller.deleteProduct.bind(this.controller)
        );
    }
}
