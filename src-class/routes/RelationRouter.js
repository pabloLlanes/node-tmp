import BaseRouter from './BaseRouter.js';
import { check, param } from 'express-validator';
import { ValidationMiddleware } from '../middlewares/ValidationMiddleware.js';
import { AuthMiddleware } from '../middlewares/AuthMiddleware.js';
import Product from '../models/ProductModel.js';
import Category from '../models/CategoryModel.js';
import User from '../models/UserModel.js';

export class RelationRouter extends BaseRouter {
    constructor() {
        super();
        this.setupRoutes();
    }
    
    initializeRoutes() {
        // Todas las rutas requieren autenticación
        this.router.use(AuthMiddleware.verifyToken);
        
        // Asignar creador a un producto
        this.router.post('/products/:productId/creator', [
            param('productId').isMongoId().withMessage('ID de producto no válido'),
            check('userId').optional().isMongoId().withMessage('ID de usuario no válido'),
            ValidationMiddleware.handleValidationErrors
        ], this.assignCreatorToProduct.bind(this));
        
        // Asignar categoría a un producto
        this.router.post('/products/:productId/category', [
            param('productId').isMongoId().withMessage('ID de producto no válido'),
            check('categoryId').isMongoId().withMessage('ID de categoría no válido'),
            ValidationMiddleware.handleValidationErrors
        ], this.assignCategoryToProduct.bind(this));
        
        // Asignar múltiples productos a una categoría
        this.router.post('/categories/:categoryId/products', [
            param('categoryId').isMongoId().withMessage('ID de categoría no válido'),
            check('productIds').isArray({ min: 1 }).withMessage('Debe proporcionar al menos un ID de producto'),
            check('productIds.*').isMongoId().withMessage('Todos los IDs de productos deben ser válidos'),
            ValidationMiddleware.handleValidationErrors
        ], this.assignProductsToCategory.bind(this));
        
        // Obtener productos de un usuario
        this.router.get('/users/:userId/products', [
            param('userId').isMongoId().withMessage('ID de usuario no válido'),
            ValidationMiddleware.handleValidationErrors
        ], this.getUserProducts.bind(this));
    }
    
    async assignCreatorToProduct(req, res) {
        try {
            const { productId } = req.params;
            const userId = req.body.userId || req.user._id;
    
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Producto no encontrado' 
                });
            }
    
            if (product.creator && 
                product.creator.toString() !== req.user._id.toString() && 
                req.user.role !== 'admin') {
                return res.status(403).json({ 
                    success: false, 
                    message: 'No tienes permiso para cambiar el creador de este producto' 
                });
            }
    
            const userExists = await User.findById(userId);
            if (!userExists) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Usuario no encontrado' 
                });
            }
    
            product.creator = userId;
            await product.save();
    
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
    }
    
    async assignCategoryToProduct(req, res) {
        try {
            const { productId } = req.params;
            const { categoryId } = req.body;
    
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Producto no encontrado' 
                });
            }
    
            if (product.creator && 
                product.creator.toString() !== req.user._id.toString() && 
                req.user.role !== 'admin') {
                return res.status(403).json({ 
                    success: false, 
                    message: 'No tienes permiso para cambiar la categoría de este producto' 
                });
            }
    
            const categoryExists = await Category.findById(categoryId);
            if (!categoryExists) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Categoría no encontrada' 
                });
            }
    
            product.category = categoryId;
            await product.save();
    
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
    }
    
    async assignProductsToCategory(req, res) {
        try {
            const { categoryId } = req.params;
            const { productIds } = req.body;
    
            if (req.user.role !== 'admin') {
                return res.status(403).json({ 
                    success: false, 
                    message: 'Solo los administradores pueden asignar múltiples productos a una categoría' 
                });
            }
    
            const categoryExists = await Category.findById(categoryId);
            if (!categoryExists) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Categoría no encontrada' 
                });
            }
    
            const updateResult = await Product.updateMany(
                { _id: { $in: productIds } },
                { category: categoryId }
            );
    
            const updatedProducts = await Product.find({ _id: { $in: productIds } });
    
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
    }
    
    async getUserProducts(req, res) {
        try {
            const { userId } = req.params;
            
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
    
            const userExists = await User.findById(userId);
            if (!userExists) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Usuario no encontrado' 
                });
            }
    
            const products = await Product.find({ creator: userId })
                .populate('category')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });
    
            const total = await Product.countDocuments({ creator: userId });
    
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
    }
}
