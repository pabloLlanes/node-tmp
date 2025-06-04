import BaseRouter from './BaseRouter.js';
import { OrderController } from '../controllers/OrderController.js';
import { check, param } from 'express-validator';
import { ValidationMiddleware } from '../middlewares/ValidationMiddleware.js';
import { AuthMiddleware } from '../middlewares/AuthMiddleware.js';

export class OrderRouter extends BaseRouter {
    constructor() {
        super();
        this.controller = new OrderController();
        this.setupRoutes();
    }
    
    initializeRoutes() {
        // Todas las rutas requieren autenticación
        this.router.use(AuthMiddleware.verifyToken);
        
        // Obtener todas las órdenes (filtradas por usuario si no es admin)
        this.router.get('/', 
            this.controller.getOrders.bind(this.controller)
        );
        
        // Obtener orden por ID
        this.router.get('/:id', 
            [
                param('id', 'ID de orden no válido').isMongoId()
            ],
            ValidationMiddleware.handleValidationErrors,
            this.controller.getOrder.bind(this.controller)
        );
        
        // Crear nueva orden
        this.router.post('/', 
            [
                check('items').isArray({ min: 1 }).withMessage('Debe incluir al menos un producto'),
                check('items.*.productId').isMongoId().withMessage('ID de producto no válido'),
                check('items.*.quantity').isInt({ min: 1 }).withMessage('La cantidad debe ser un entero positivo')
            ],
            ValidationMiddleware.handleValidationErrors,
            this.controller.createOrder.bind(this.controller)
        );
        
        // Actualizar estado de la orden
        this.router.patch('/:id/status', 
            [
                param('id', 'ID de orden no válido').isMongoId(),
                check('status').isIn(['pending', 'completed', 'cancelled']).withMessage('Estado no válido')
            ],
            ValidationMiddleware.handleValidationErrors,
            this.controller.updateOrderStatus.bind(this.controller)
        );
        
        // Eliminar orden (solo admin)
        this.router.delete('/:id', 
            [
                param('id', 'ID de orden no válido').isMongoId()
            ],
            ValidationMiddleware.handleValidationErrors,
            AuthMiddleware.verifyAdminRole,
            this.controller.deleteOrder.bind(this.controller)
        );
    }
}
