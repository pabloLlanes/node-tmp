import BaseController from './BaseController.js';
import Order from '../models/OrderModel.js';
import Product from '../models/ProductModel.js';

export class OrderController extends BaseController {
    constructor() {
        super(Order);
    }

    async getOrders(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            // Filtrar por usuario si no es admin
            const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
            
            // Filtrar por estado si se proporciona
            if (req.query.status) {
                filter.status = req.query.status;
            }

            const orders = await Order.find(filter)
                .populate('user', 'username email')
                .populate('items.product', 'name price image')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            const total = await Order.countDocuments(filter);

            return res.json({
                success: true,
                count: orders.length,
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                orders
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener órdenes',
                error: error.message
            });
        }
    }

    async getOrder(req, res) {
        try {
            const orderId = req.params.id;
            
            const order = await Order.findById(orderId)
                .populate('user', 'username email')
                .populate('items.product', 'name price image');
            
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Orden no encontrada'
                });
            }
            
            // Verificar permisos (solo el usuario dueño o admin)
            if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permiso para ver esta orden'
                });
            }
            
            return res.json({
                success: true,
                order
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener la orden',
                error: error.message
            });
        }
    }

    async createOrder(req, res) {
        try {
            const { items, shippingAddress } = req.body;
            
            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'La orden debe contener al menos un producto'
                });
            }
            
            // Verificar y preparar los productos
            const orderItems = [];
            let totalPrice = 0;
            let totalItems = 0;
            
            for (const item of items) {
                if (!item.productId || !item.quantity || item.quantity < 1) {
                    return res.status(400).json({
                        success: false,
                        message: 'Cada item debe tener productId y quantity válidos'
                    });
                }
                
                const product = await Product.findById(item.productId);
                
                if (!product) {
                    return res.status(404).json({
                        success: false,
                        message: `Producto con ID ${item.productId} no encontrado`
                    });
                }
                
                if (!product.isAvailable) {
                    return res.status(400).json({
                        success: false,
                        message: `El producto ${product.name} no está disponible`
                    });
                }
                
                if (product.stock < item.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `Stock insuficiente para ${product.name}. Disponible: ${product.stock}`
                    });
                }
                
                orderItems.push({
                    product: product._id,
                    quantity: item.quantity,
                    price: product.price,
                    name: product.name
                });
                
                totalPrice += product.price * item.quantity;
                totalItems += item.quantity;
                
                // Actualizar el stock del producto
                product.stock -= item.quantity;
                await product.save();
            }
            
            // Crear la orden
            const newOrder = await Order.create({
                user: req.user._id,
                items: orderItems,
                totalPrice,
                totalItems,
                shippingAddress,
                status: 'pending'
            });
            
            // Poblar la respuesta
            const populatedOrder = await Order.findById(newOrder._id)
                .populate('user', 'username email')
                .populate('items.product', 'name price image');
            
            return res.status(201).json({
                success: true,
                message: 'Orden creada exitosamente',
                order: populatedOrder
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'Error al crear la orden',
                error: error.message
            });
        }
    }

    async updateOrderStatus(req, res) {
        try {
            const orderId = req.params.id;
            const { status } = req.body;
            
            if (!status || !['pending', 'completed', 'cancelled'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Estado de orden inválido'
                });
            }
            
            const order = await Order.findById(orderId);
            
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Orden no encontrada'
                });
            }
            
            // Solo el admin puede cambiar cualquier orden
            // El usuario solo puede cancelar sus propias órdenes pendientes
            if (req.user.role !== 'admin') {
                if (order.user.toString() !== req.user._id.toString()) {
                    return res.status(403).json({
                        success: false,
                        message: 'No tienes permiso para actualizar esta orden'
                    });
                }
                
                if (status !== 'cancelled') {
                    return res.status(403).json({
                        success: false,
                        message: 'Solo puedes cancelar tu orden, no cambiar a otros estados'
                    });
                }
                
                if (order.status !== 'pending') {
                    return res.status(400).json({
                        success: false,
                        message: 'Solo puedes cancelar órdenes pendientes'
                    });
                }
            }
            
            // Si se cancela, devolver stock
            if (status === 'cancelled' && order.status !== 'cancelled') {
                for (const item of order.items) {
                    await Product.findByIdAndUpdate(
                        item.product,
                        { $inc: { stock: item.quantity } }
                    );
                }
            }
            
            order.status = status;
            await order.save();
            
            const updatedOrder = await Order.findById(orderId)
                .populate('user', 'username email')
                .populate('items.product', 'name price image');
            
            return res.json({
                success: true,
                message: 'Estado de orden actualizado exitosamente',
                order: updatedOrder
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'Error al actualizar estado de la orden',
                error: error.message
            });
        }
    }

    async deleteOrder(req, res) {
        try {
            const orderId = req.params.id;
            
            // Solo los administradores pueden eliminar órdenes
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Solo los administradores pueden eliminar órdenes'
                });
            }
            
            const order = await Order.findById(orderId);
            
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Orden no encontrada'
                });
            }
            
            // Si la orden está pendiente o completada, devolver stock
            if (order.status !== 'cancelled') {
                for (const item of order.items) {
                    await Product.findByIdAndUpdate(
                        item.product,
                        { $inc: { stock: item.quantity } }
                    );
                }
            }
            
            await Order.findByIdAndDelete(orderId);
            
            return res.json({
                success: true,
                message: 'Orden eliminada exitosamente',
                orderId
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'Error al eliminar la orden',
                error: error.message
            });
        }
    }
}
