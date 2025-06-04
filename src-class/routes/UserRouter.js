import BaseRouter from './BaseRouter.js';
import { UserController } from '../controllers/UserController.js';
import { check, param } from 'express-validator';
import { ValidationMiddleware } from '../middlewares/ValidationMiddleware.js';
import { AuthMiddleware } from '../middlewares/AuthMiddleware.js';

export class UserRouter extends BaseRouter {
    constructor() {
        super();
        this.controller = new UserController();
        this.setupRoutes();
    }
    
    initializeRoutes() {
        // Ruta de login
        this.router.post('/login', 
            [
                check('email', 'El email es obligatorio').isEmail().normalizeEmail(),
                check('password', 'El password es obligatorio').not().isEmpty()
            ],
            ValidationMiddleware.handleValidationErrors,
            this.controller.login.bind(this.controller)
        );
        
        // Obtener todos los usuarios
        this.router.get('/', 
            this.controller.getUsers.bind(this.controller)
        );
        
        // Obtener usuario por ID
        this.router.get('/:id', 
            [
                param('id', 'El id proporcionado no es de mongodb').isMongoId()
            ],
            ValidationMiddleware.handleValidationErrors,
            AuthMiddleware.checkUserExists,
            this.controller.getUser.bind(this.controller)
        );
        
        // Crear usuario (solo admin)
        this.router.post('/', 
            [
                check('username', 'El nombre es obligatorio').not().isEmpty().trim(),
                check('email', 'El email es obligatorio').isEmail().normalizeEmail(),
                check('password', 'El password es obligatorio').not().isEmpty()
            ],
            ValidationMiddleware.handleValidationErrors,
            AuthMiddleware.verifyToken,
            AuthMiddleware.verifyAdminRole,
            this.controller.createUser.bind(this.controller)
        );
        
        // Eliminar usuario (solo admin)
        this.router.delete('/:id', 
            [
                param('id', 'El id proporcionado no es de mongodb').isMongoId()
            ],
            ValidationMiddleware.handleValidationErrors,
            AuthMiddleware.verifyToken,
            AuthMiddleware.verifyAdminRole,
            this.controller.deleteUser.bind(this.controller)
        );
        
        // Actualizar usuario
        this.router.put('/:id', 
            [
                param('id', 'El id proporcionado no es de mongodb').isMongoId()
            ],
            ValidationMiddleware.handleValidationErrors,
            AuthMiddleware.verifyToken,
            this.controller.updateUser.bind(this.controller)
        );
    }
}
