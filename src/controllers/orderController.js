/**
 * ==========================================
 * CONTROLADOR DE ÓRDENES (orderController.js)
 * ==========================================
 * Este archivo contiene los controladores para la gestión de órdenes (pedidos) en la API.
 * Implementa operaciones para crear, listar, consultar, actualizar estado y cancelar órdenes.
 * Maneja lógica de negocio como validación de stock y permisos según roles de usuario.
 */

// =============== IMPORTACIONES ===============

/**
 * Modelos de la base de datos (MongoDB/Mongoose)
 */
import Order from "../models/Order.js";     // Modelo de órdenes para operaciones CRUD
import Product from "../models/Product.js";  // Modelo de productos para verificar stock
import User from "../models/User.js";      // Modelo de usuarios para verificaciones

/**
 * createOrder - Crear una nueva orden de compra
 * 
 * @param {object} req - Objeto Request de Express
 * @param {object} res - Objeto Response de Express
 * @returns {object} Respuesta JSON con la orden creada
 * 
 * Endpoint: POST /api/orders
 */
export const createOrder = async (req, res) => {
    try {
        // 1. EXTRAER DATOS: Del cuerpo de la petición
        const { 
            items,
            shippingAddress,
            paymentInfo
        } = req.body;

        // 2. VERIFICAR USUARIO: Debe estar autenticado para crear una orden
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Debe iniciar sesión para realizar una compra'
            });
        }

        // 3. VERIFICAR ITEMS: Comprobar que hay productos y existe cada uno
        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'La orden debe contener al menos un producto'
            });
        }

        // 4. PROCESAR ITEMS: Validar existencia, stock y obtener datos actualizados
        const orderItems = [];
        
        // Procesamos cada item de la orden
        for (const item of items) {
            const product = await Product.findById(item.product);
            
            // Verificar que el producto existe
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Producto con ID ${item.product} no encontrado`
                });
            }
            
            // Verificar que hay stock suficiente
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Stock insuficiente para ${product.name}. Disponible: ${product.stock}, Solicitado: ${item.quantity}`
                });
            }
            
            // Añadir a los items de la orden con datos actualizados
            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                price: product.price,
                productName: product.name
            });
            
            // Reducir el stock del producto
            product.stock -= item.quantity;
            await product.save();
        }

        // 5. CREAR LA ORDEN: Con todos los datos validados
        const order = await Order.create({
            user: req.user._id,
            items: orderItems,
            shippingAddress,
            paymentInfo,
            totalItems: orderItems.reduce((sum, item) => sum + item.quantity, 0),
            totalPrice: orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        });

        // 6. RESPUESTA: Devolver la orden creada
        res.status(201).json({
            success: true,
            message: 'Orden creada exitosamente',
            order
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error al crear la orden',
            error: error.message
        });
    }
};

/**
 * getOrders - Obtener todas las órdenes (admin) o del usuario actual
 * 
 * @param {object} req - Objeto Request de Express
 * @param {object} res - Objeto Response de Express
 * @returns {object} Respuesta JSON con las órdenes
 * 
 * Endpoint: GET /api/orders
 */
export const getOrders = async (req, res) => {
    try {
        // 1. PAGINACIÓN: Configuración
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // 2. FILTRO: Si es admin puede ver todas, sino solo las suyas
        const filter = {};
        
        // Si no es admin o no se especifica verTodas, filtrar por usuario
        if (!req.user.isAdmin || req.query.verTodas !== 'true') {
            filter.user = req.user._id;
        }
        
        // 3. CONSULTA: Obtener órdenes con paginación
        const orders = await Order.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }) // Más recientes primero
            .populate('user', 'name email'); // Incluir datos básicos del usuario
        
        // 4. TOTAL: Para paginación
        const total = await Order.countDocuments(filter);
        
        // 5. RESPUESTA
        res.json({
            success: true,
            count: orders.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            orders
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las órdenes',
            error: error.message
        });
    }
};

/**
 * getOrderById - Obtener una orden específica por su ID
 * 
 * @param {object} req - Objeto Request de Express
 * @param {object} res - Objeto Response de Express
 * @returns {object} Respuesta JSON con la orden
 * 
 * Endpoint: GET /api/orders/:id
 */
export const getOrderById = async (req, res) => {
    try {
        const orderId = req.params.id;
        
        // Buscar la orden y poblar datos relacionados
        const order = await Order.findById(orderId)
            .populate('user', 'name email')
            .populate('items.product', 'name image'); // Incluir detalles del producto
        
        // Verificar que la orden existe
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Orden no encontrada'
            });
        }
        
        // Verificar permisos: solo el usuario dueño de la orden o un admin puede verla
        if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'No tiene permiso para ver esta orden'
            });
        }
        
        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la orden',
            error: error.message
        });
    }
};

/**
 * updateOrderStatus - Actualizar el estado de una orden
 * 
 * @param {object} req - Objeto Request de Express
 * @param {object} res - Objeto Response de Express
 * @returns {object} Respuesta JSON con la orden actualizada
 * 
 * Endpoint: PATCH /api/orders/:id/status
 */
export const updateOrderStatus = async (req, res) => {
    try {
        // 1. EXTRAER DATOS
        const orderId = req.params.id;
        const { status, paymentStatus } = req.body;
        
        // 2. VERIFICAR PERMISO: Sólo administradores
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'No tiene permiso para actualizar órdenes'
            });
        }
        
        // 3. BUSCAR ORDEN
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Orden no encontrada'
            });
        }
        
        // 4. ACTUALIZAR DATOS
        // Actualizar estado general de la orden
        if (status) {
            order.status = status;
            
            // Si se marca como entregada, registrar la fecha
            if (status === 'delivered') {
                order.deliveredAt = Date.now();
            }
        }
        
        // Actualizar estado del pago
        if (paymentStatus) {
            order.paymentInfo.status = paymentStatus;
            
            // Si se marca como completado, registrar la fecha
            if (paymentStatus === 'completed') {
                order.paymentInfo.paidAt = Date.now();
            }
        }
        
        // 5. GUARDAR CAMBIOS
        await order.save();
        
        // 6. RESPUESTA
        res.json({
            success: true,
            message: 'Estado de la orden actualizado',
            order
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el estado de la orden',
            error: error.message
        });
    }
};

/**
 * cancelOrder - Cancelar una orden y devolver stock
 * 
 * @param {object} req - Objeto Request de Express
 * @param {object} res - Objeto Response de Express
 * @returns {object} Respuesta JSON con confirmación
 * 
 * Endpoint: POST /api/orders/:id/cancel
 */
export const cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        
        // Obtener la orden
        const order = await Order.findById(orderId).populate('items.product');
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Orden no encontrada'
            });
        }
        
        // Verificar permisos: el usuario dueño de la orden o un admin
        if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'No tiene permiso para cancelar esta orden'
            });
        }
        
        // Verificar que la orden puede ser cancelada (solo en ciertos estados)
        if (!['pending', 'processing'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: `No se puede cancelar una orden con estado "${order.status}"`
            });
        }
        
        // Devolver stock a los productos
        for (const item of order.items) {
            const product = await Product.findById(item.product);
            
            if (product) {
                product.stock += item.quantity;
                await product.save();
            }
        }
        
        // Cambiar estado de la orden
        order.status = 'cancelled';
        await order.save();
        
        res.json({
            success: true,
            message: 'Orden cancelada exitosamente',
            order
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error al cancelar la orden',
            error: error.message
        });
    }
};
