import BaseRouter from './BaseRouter.js';
import { CategoryController } from '../controllers/CategoryController.js';
import { check, param } from 'express-validator';
import { ValidationMiddleware } from '../middlewares/ValidationMiddleware.js';
import { AuthMiddleware } from '../middlewares/AuthMiddleware.js';

export class CategoryRouter extends BaseRouter {
    constructor() {
        super();
        this.controller = new CategoryController();
        this.setupRoutes();
    }
    
    initializeRoutes() {
        // Obtener todas las categorías
        this.router.get('/',
            this.controller.getCategories.bind(this.controller)
        );
        
        // Obtener una categoría por ID
        this.router.get('/:id',
            [
                param('id', 'El id proporcionado no es válido').isMongoId()
            ],
            ValidationMiddleware.handleValidationErrors,
            this.controller.getCategory.bind(this.controller)
        );
        
        // Crear nueva categoría (requiere autenticación y rol admin)
        this.router.post('/',
            [
                check('name', 'El nombre es obligatorio').not().isEmpty().trim(),
                check('description').optional().trim()
            ],
            ValidationMiddleware.handleValidationErrors,
            AuthMiddleware.verifyToken,
            AuthMiddleware.verifyAdminRole,
            this.controller.createCategory.bind(this.controller)
        );
        
        // Actualizar categoría (requiere autenticación y rol admin)
        this.router.put('/:id',
            [
                param('id', 'El id proporcionado no es válido').isMongoId(),
                check('name').optional().not().isEmpty().trim(),
                check('description').optional().trim()
            ],
            ValidationMiddleware.handleValidationErrors,
            AuthMiddleware.verifyToken,
            AuthMiddleware.verifyAdminRole,
            this.controller.updateCategory.bind(this.controller)
        );
        
        // Eliminar categoría (requiere autenticación y rol admin)
        this.router.delete('/:id',
            [
                param('id', 'El id proporcionado no es válido').isMongoId()
            ],
            ValidationMiddleware.handleValidationErrors,
            AuthMiddleware.verifyToken,
            AuthMiddleware.verifyAdminRole,
            this.controller.deleteCategory.bind(this.controller)
        );
    }
}
