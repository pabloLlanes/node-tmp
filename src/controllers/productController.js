/**
 * ==========================================
 * CONTROLADOR DE PRODUCTOS (productController.js)
 * ==========================================
 * Este archivo contiene los controladores para la gestión de productos en la API.
 * Implementa operaciones CRUD (Crear, Leer, Actualizar, Eliminar) y funcionalidades
 * avanzadas como búsqueda, filtrado y subida de imágenes.
 */

// ============== IMPORTACIONES ==============

/**
 * Modelos de la base de datos (MongoDB/Mongoose)
 */
import Product from "../models/Product.js"    // Modelo de productos para operaciones CRUD
import Category from "../models/Category.js"; // Modelo de categorías para validaciones

/**
 * Módulos nativos de Node.js
 */
import path from 'path';                     // Para manejar rutas de archivos y directorios
import fs from 'fs';                         // Para operaciones del sistema de archivos (crear/eliminar archivos)


/**
 * getProducts - Obtiene una lista paginada de todos los productos
 * 
 * @param {object} req - Objeto Request de Express
 * @param {object} res - Objeto Response de Express
 * @returns {object} Respuesta JSON con productos y metadatos de paginaciu00f3n
 * 
 * Endpoint: GET /api/products?page=1&limit=10
 */
export const getProducts = async (req, res) => {
    try {
        // 1. PAGINACIÓN: Extraer y parsear parámetros de query
        const page = parseInt(req.query.page) || 1;    // Página actual (default: 1)
        const limit = parseInt(req.query.limit) || 10; // Elementos por página (default: 10)
        const skip = (page - 1) * limit;              // Cálculo de documentos a saltar

        // 2. CONSULTA: Obtener productos con paginación
        const products = await Product.find()          // Encuentra todos los productos
            .skip(skip)                               // Salta los productos según la página
            .limit(limit)                             // Limita el número de resultados
            .sort({ createdAt: -1 });                 // Ordena por fecha de creación descendente (más recientes primero)

        // 3. TOTAL DE RESULTADOS: Para calcular número de páginas
        const total = await Product.countDocuments();  // Total de productos en la BD

        // 4. RESPUESTA: Enviar productos con metadatos de paginación
        res.json({
            success: true,                           // Indicador de éxito
            count: products.length,                  // Número de productos en esta página
            total,                                   // Total de productos en la BD
            totalPages: Math.ceil(total / limit),    // Cálculo del total de páginas
            currentPage: page,                       // Página actual solicitada
            products                                 // Array de objetos de producto
        });

    } catch (error) {
        // 5. MANEJO DE ERRORES
        console.log(error);                          // Log del error para debug
        res.status(500).json({
            success: false,
            message: 'Error al obtener productos',
            error: error.message                     // Detalles del error (solo para desarrollo)
        });
    }
}

/**
 * searchProducts - Busca productos por texto en su nombre o descripción
 * 
 * @param {object} req - Objeto Request de Express
 * @param {object} res - Objeto Response de Express
 * @returns {object} Respuesta JSON con productos que coincidan con la búsqueda
 * 
 * Endpoint: GET /api/products/search?search=texto&page=1&limit=10
 * 
 * La búsqueda es insensible a mayúsculas/minúsculas y busca coincidencias parciales
 * en los campos nombre y descripción del producto.
 */
export const searchProducts = async (req, res) => {
    try {
        // Parámetros de paginación
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Obtener término de búsqueda
        const searchQuery = req.query.search || '';

        // Validar que se proporcionó un término
        if (!searchQuery) {
            return res.status(400).json({
                success: false,
                message: 'El parámetro de búsqueda es requerido'
            });
        }

        // Buscar en nombre O descripción, sin importar mayúsculas/minúsculas
        const filter = {
            $or: [
                { name: new RegExp(searchQuery, 'i') },
                { description: new RegExp(searchQuery, 'i') }
            ]
        };

        // Ejecutar consulta
        const products = await Product.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Product.countDocuments(filter);

        // Retornar resultados con metadatos de paginación
        res.json({
            success: true,
            count: products.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            searchQuery,
            products
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error al buscar productos',
            error: error.message
        });
    }
}

/**
 * filterProducts - Filtra productos por precio y disponibilidad
 * 
 * @param {object} req - Objeto Request de Express
 * @param {object} res - Objeto Response de Express
 * @returns {object} Respuesta JSON con productos filtrados
 * 
 * Endpoint: GET /api/products/filter?minPrice=10&maxPrice=100&isAvailable=true
 */
export const filterProducts = async (req, res) => {
    try {
        // 1. PAGINACIÓN: Configuración similar a las funciones anteriores
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // 2. PARÁMETROS DE FILTRADO: Extraer de la URL
        const { minPrice, maxPrice, isAvailable } = req.query;

        // 3. CONSTRUCCIÓN DE FILTRO DINÁMICO: Se agregan condiciones solo si se proporcionan los parámetros
        const filter = {};

        // 3.1 Filtro de precio mínimo (si existe)
        if (minPrice !== undefined) {
            // $gte = Greater Than or Equal (Mayor o igual que)
            filter.price = { ...filter.price, $gte: parseFloat(minPrice) };
        }

        // 3.2 Filtro de precio máximo (si existe)
        if (maxPrice !== undefined) {
            // $lte = Less Than or Equal (Menor o igual que)
            filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };
        }

        // 3.3 Filtro de disponibilidad (si existe)
        if (isAvailable !== undefined) {
            // Convertir string 'true'/'false' a booleano
            filter.isAvailable = isAvailable === 'true';
        }

        // 4. CONSULTA: Productos que cumplen con los filtros
        const products = await Product.find(filter)    // Aplica los filtros construidos dinámicamente
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });                 // Más recientes primero

        // 5. TOTAL DE RESULTADOS: Para la paginación
        const total = await Product.countDocuments(filter); // Total de documentos que cumplen los filtros

        // 6. RESPUESTA: Con metadatos de filtrado y paginación
        res.json({
            success: true,
            count: products.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            filters: { minPrice, maxPrice, isAvailable }, // Incluir los filtros aplicados en la respuesta
            products                                      // Productos filtrados
        });

    } catch (error) {
        // 7. MANEJO DE ERRORES
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error al filtrar productos',
            error: error.message
        });
    }
}

/**
 * getProductById - Obtiene un producto específico por su ID
 * 
 * @param {object} req - Objeto Request de Express
 * @param {object} res - Objeto Response de Express
 * @returns {object} Respuesta JSON con el producto solicitado
 * 
 * Endpoint: GET /api/products/:id
 * 
 * Se utiliza el método populate() de Mongoose para incluir información completa de la categoría
 * relacionada con el producto.
 */
export const getProductById = async (req, res) => {
    try {
        // Extraer el ID del producto de los parámetros de la URL
        const productId = req.params.id;

        // Buscar el producto por ID y poblar la información de su categoría y creador
        const product = await Product.findById(productId)
            .populate('category')
            .populate('creator');

        // Verificar si el producto existe
        if (!product) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }

        // Devolver el producto encontrado (con relaciones)
        res.json({ success: true, product });

    } catch (error) {
        // Manejar errores (ej: ID con formato incorrecto)
        console.log(error);
        res.status(500).json({ success: false, message: 'Error al obtener el producto', error: error.message });
    }
}

/**
 * createProduct - Crea un nuevo producto en la base de datos
 * 
 * @param {object} req - Objeto Request de Express con los datos del producto en el body
 * @param {object} res - Objeto Response de Express
 * @returns {object} Respuesta JSON con el producto creado
 * 
 * Endpoint: POST /api/products
 * 
 * Cuerpo de la petición esperado:
 * {
 *   "name": "Nombre del producto",
 *   "price": 99.99,
 *   "description": "Descripción del producto",
 *   "category": "id_de_categoría",
 *   "available": true,
 *   "stock": 10,
 *   "image": "/url/de/imagen.jpg" (opcional)
 * }
 */
export const createProduct = async (req, res) => {
    try {
        // Extraer datos del cuerpo de la solicitud
        const { name, price, description, category, available, stock, image } = req.body;

        // Si se proporciona una categoría, verificar que exista en la base de datos
        if (category) {
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return res.status(400).json({ success: false, message: 'La categoría especificada no existe' });
            }
        }

        // Opcional: Agregar usuario creador si está autenticado
        // if (req.user) {
        //     productData.creator = req.user._id;
        // }

        // Crear nuevo producto en la base de datos usando el modelo Product
        const newProduct = await Product.create({
            name, price, description, category, available, stock, image,
            // creator: req.user ? req.user._id : null // Si está implementada la autenticación
        });

        // Responder con código 201 (Created) y los datos del nuevo producto
        res.status(201).json({ success: true, product: newProduct });

    } catch (error) {
        // Manejar errores (validación, conexión a BD, etc.)
        console.log(error);
        res.status(500).json({ success: false, message: 'Error al crear el producto', error: error.message });
    }
}

/**
 * updateProduct - Actualiza un producto existente (reemplazo completo)
 * 
 * @param {object} req - Objeto Request de Express con el ID en params y datos actualizados en body
 * @param {object} res - Objeto Response de Express
 * @returns {object} Respuesta JSON con el producto actualizado
 * 
 * Endpoint: PUT /api/products/:id
 * 
 * Cuerpo de la petición esperado:
 * {
 *   "name": "Nombre actualizado",
 *   "price": 129.99,
 *   "description": "Nueva descripción",
 *   "category": "id_de_categoría",
 *   "available": true,
 *   "stock": 15,
 *   "image": "/url/nueva_imagen.jpg"
 * }
 */
export const updateProduct = async (req, res) => {
    try {
        // Extraer el ID del producto de los parámetros de la URL
        const productId = req.params.id;
        // Extraer los datos actualizados del cuerpo de la solicitud
        const { name, price, description, category, available, stock, image } = req.body;

        // Verificar si el producto existe
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }

        // Verificar si se está actualizando la categoría y validar que exista
        if (category) {
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return res.status(400).json({ success: false, message: 'La categoría especificada no existe' });
            }
        }

        // Opcional: Verificar si el usuario tiene permisos para actualizar
        // if (req.user && product.creator && product.creator.toString() !== req.user._id.toString()) {
        //     return res.status(403).json({ success: false, message: 'No tienes permiso para actualizar este producto' });
        // }

        // Actualizar el producto y devolver la versión actualizada (new: true)
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { name, price, description, category, available, stock, image },
            { new: true } // Esta opción hace que se devuelva el documento actualizado en lugar del original
        ).populate('category'); // Incluir información completa de la categoría

        // Enviar respuesta con el producto actualizado
        res.json({ success: true, product: updatedProduct });

    } catch (error) {
        // Manejar errores
        console.log(error);
        res.status(500).json({ success: false, message: 'Error al actualizar el producto', error: error.message });
    }
}

/**
 * patchProduct - Actualiza parcialmente un producto existente
 * 
 * @param {object} req - Objeto Request de Express con el ID en params y campos a actualizar en body
 * @param {object} res - Objeto Response de Express
 * @returns {object} Respuesta JSON con el producto parcialmente actualizado
 * 
 * Endpoint: PATCH /api/products/:id
 * 
 * A diferencia del método PUT (updateProduct), PATCH permite actualizar solo
 * los campos específicos que se envíen en el cuerpo de la petición.
 * 
 * Cuerpo de la petición ejemplo (solo incluye los campos a actualizar):
 * {
 *   "price": 79.99,
 *   "stock": 25
 * }
 */
export const patchProduct = async (req, res) => {
    try {
        // Extraer el ID del producto a actualizar
        const productId = req.params.id;
        // Obtener los campos a actualizar del cuerpo de la petición
        const updates = req.body;

        // Verificar si el producto existe
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }

        // Si se está actualizando la categoría, verificar que exista
        if (updates.category) {
            const categoryExists = await Category.findById(updates.category);
            if (!categoryExists) {
                return res.status(400).json({ success: false, message: 'La categoría especificada no existe' });
            }
        }

        // Opcional: Verificar si el usuario tiene permisos para actualizar
        // if (req.user && product.creator && product.creator.toString() !== req.user._id.toString()) {
        //     return res.status(403).json({ success: false, message: 'No tienes permiso para actualizar este producto' });
        // }

        // Actualización parcial: solo actualiza los campos proporcionados usando $set
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { $set: updates }, // $set es un operador de MongoDB que solo actualiza los campos especificados
            { new: true }      // Devuelve el documento actualizado en lugar del original
        ).populate('category');

        // Enviar respuesta con el producto parcialmente actualizado
        res.json({
            success: true,
            message: 'Producto actualizado parcialmente',
            product: updatedProduct
        });

    } catch (error) {
        // Manejar errores
        console.log(error);
        res.status(500).json({ success: false, message: 'Error al actualizar parcialmente el producto', error: error.message });
    }
}

/**
 * deleteProduct - Elimina un producto de la base de datos
 * 
 * @param {object} req - Objeto Request de Express con el ID del producto a eliminar
 * @param {object} res - Objeto Response de Express
 * @returns {object} Respuesta JSON con mensaje de confirmación
 * 
 * Endpoint: DELETE /api/products/:id
 * 
 * Nota: Esta es una eliminación permanente. En sistemas de producción,
 * a menudo se prefiere una eliminación lógica (soft delete) que marque el
 * elemento como eliminado pero lo mantenga en la base de datos.
 */
export const deleteProduct = async (req, res) => {
    try {
        // Extraer el ID del producto a eliminar
        const productId = req.params.id;

        // Verificar si el producto existe
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }

        // Opcional: Verificar si el usuario tiene permisos para eliminar
        // if (req.user && product.creator && product.creator.toString() !== req.user._id.toString()) {
        //     return res.status(403).json({ success: false, message: 'No tienes permiso para eliminar este producto' });
        // }

        // Eliminar el producto de la base de datos
        await Product.findByIdAndDelete(productId);

        // Enviar respuesta confirmando la eliminación
        res.json({ success: true, message: `Producto con ID: ${productId} eliminado correctamente` });

    } catch (error) {
        // Manejar errores
        console.log(error);
        res.status(500).json({ success: false, message: 'Error al eliminar el producto', error: error.message });
    }
}

/**
 * uploadProductImage - Sube una imagen para un producto y actualiza su URL
 * 
 * @param {object} req - Objeto Request de Express con el ID del producto y el archivo subido
 * @param {object} res - Objeto Response de Express
 * @returns {object} Respuesta JSON con el producto actualizado y datos de la imagen
 * 
 * Endpoint: POST /api/products/:id/image
 * 
 * Nota: Este endpoint requiere el middleware de Multer para procesar
 * la carga de archivos. El middleware debe configurarse en el router
 * correspondiente antes de que se llame a esta función.
 * 
 * La solicitud debe ser multipart/form-data con un campo 'image' que contenga el archivo.
 */
export const uploadProductImage = async (req, res) => {
    try {
        // Extraer el ID del producto
        const productId = req.params.id;

        // Verificar si existe el producto en la base de datos
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }

        // El middleware de Multer ya ha procesado el archivo y lo ha guardado
        // req.file contiene la información del archivo subido
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No se ha subido ninguna imagen' });
        }

        // Construir la URL relativa para acceder a la imagen
        // Esta URL se almacenará en la base de datos y permitirá acceder a la imagen desde el frontend
        const imageUrl = `/uploads/products/${req.file.filename}`;

        // Actualizar el producto con la URL de la imagen
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { image: imageUrl }, // Actualizar solo el campo de imagen
            { new: true }       // Devolver el documento actualizado
        );

        // Enviar respuesta con información completa
        res.json({
            success: true,
            message: 'Imagen subida correctamente',
            product: updatedProduct,  // Producto actualizado con la nueva URL de imagen
            imageUrl,                 // URL de la imagen para acceso directo
            file: req.file            // Información del archivo subido (nombre, tamaño, etc.)
        });

    } catch (error) {
        // Manejar errores
        console.log(error);
        res.status(500).json({ success: false, message: 'Error al subir la imagen', error: error.message });
    }
}