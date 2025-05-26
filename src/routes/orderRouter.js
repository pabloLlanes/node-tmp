import { Router } from 'express';
import { 
    createOrder, 
    getOrders, 
    getOrderById, 
    updateOrderStatus,
    cancelOrder 
} from '../controllers/orderController.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = Router();

// ======= RUTAS PARA ÓRDENES =======

/**
 * @route   POST /api/orders
 * @desc    Crear una nueva orden
 * @access  Private (Solo usuarios autenticados)
 */
router.post('/', verifyToken, createOrder);

/**
 * @route   GET /api/orders
 * @desc    Obtener todas las órdenes (admin) o las órdenes del usuario
 * @access  Private
 */
router.get('/', verifyToken, getOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Obtener una orden específica por ID
 * @access  Private (Usuario dueño de la orden o admin)
 */
router.get('/:id', verifyToken, getOrderById);

/**
 * @route   PATCH /api/orders/:id/status
 * @desc    Actualizar el estado de una orden
 * @access  Private (Solo admin)
 */
router.patch('/:id/status', verifyToken, updateOrderStatus);

/**
 * @route   POST /api/orders/:id/cancel
 * @desc    Cancelar una orden
 * @access  Private (Usuario dueño de la orden o admin)
 */
router.post('/:id/cancel', verifyToken, cancelOrder);

export default router;
