import Product from "../models/Product.js";
import Category from "../models/Category.js";
import path from 'path';
import fs from 'fs';

export const getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const products = await Product.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Product.countDocuments();

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
            message: 'Error al obtener productos',
            error: error.message
        });
    }
}

export const searchProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const searchQuery = req.query.search || '';

        if (!searchQuery.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere un término de búsqueda'
            });
        }

        const searchRegex = new RegExp(searchQuery, 'i');

        const products = await Product.find({
            $or: [
                { name: searchRegex },
                { description: searchRegex }
            ]
        })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Product.countDocuments({
            $or: [
                { name: searchRegex },
                { description: searchRegex }
            ]
        });

        res.json({
            success: true,
            count: products.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            searchTerm: searchQuery,
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

export const filterProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
        const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
        const isAvailable = req.query.isAvailable !== undefined ? req.query.isAvailable === 'true' : undefined;

        const filterQuery = {};

        if (minPrice !== undefined && maxPrice !== undefined) {
            filterQuery.price = { $gte: minPrice, $lte: maxPrice };
        } else if (minPrice !== undefined) {
            filterQuery.price = { $gte: minPrice };
        } else if (maxPrice !== undefined) {
            filterQuery.price = { $lte: maxPrice };
        }

        if (isAvailable !== undefined) {
            filterQuery.available = isAvailable;
        }

        const products = await Product.find(filterQuery)
            .skip(skip)
            .limit(limit)
            .sort({ price: 1 });

        const total = await Product.countDocuments(filterQuery);

        res.json({
            success: true,
            count: products.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            filters: {
                minPrice,
                maxPrice,
                isAvailable
            },
            products
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error al filtrar productos',
            error: error.message
        });
    }
}

export const getProductById = async (req, res) => {
    try {
        const productId = req.params.id;
        
        const product = await Product.findById(productId)
            .populate('category');
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
        
        res.json({
            success: true,
            product
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el producto',
            error: error.message
        });
    }
}

export const createProduct = async (req, res) => {
    try {
        const {
            name,
            price,
            description,
            category,
            available = true,
            stock = 0,
            image
        } = req.body;
        
        if (category) {
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return res.status(400).json({
                    success: false,
                    message: 'La categoría especificada no existe'
                });
            }
        }
        
        const product = await Product.create({
            name,
            price,
            description,
            category,
            available,
            stock,
            image,
            creator: req.user ? req.user._id : null
        });
        
        res.status(201).json({
            success: true,
            product
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error al crear el producto',
            error: error.message
        });
    }
}

export const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const updates = req.body;
        
        if (updates.category) {
            const categoryExists = await Category.findById(updates.category);
            if (!categoryExists) {
                return res.status(400).json({
                    success: false,
                    message: 'La categoría especificada no existe'
                });
            }
        }
        
        const product = await Product.findById(productId);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
        
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            updates,
            { new: true }
        );
        
        res.json({
            success: true,
            product: updatedProduct
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el producto',
            error: error.message
        });
    }
}

export const patchProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const updates = req.body;
        
        if (updates.category) {
            const categoryExists = await Category.findById(updates.category);
            if (!categoryExists) {
                return res.status(400).json({
                    success: false,
                    message: 'La categoría especificada no existe'
                });
            }
        }
        
        const product = await Product.findById(productId);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
        
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { $set: updates },
            { new: true }
        );
        
        res.json({
            success: true,
            message: 'Producto actualizado parcialmente',
            product: updatedProduct
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar parcialmente el producto',
            error: error.message
        });
    }
}

export const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }

        await Product.findByIdAndDelete(productId);

        res.json({ success: true, message: `Producto con ID: ${productId} eliminado correctamente` });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Error al eliminar el producto', error: error.message });
    }
}

export const uploadProductImage = async (req, res) => {
    try {
        const productId = req.params.id;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No se ha subido ninguna imagen' });
        }

        const imageUrl = `/uploads/products/${req.file.filename}`;

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { image: imageUrl },
            { new: true }
        );

        res.json({
            success: true,
            message: 'Imagen subida correctamente',
            product: updatedProduct,
            imageUrl,
            file: req.file
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Error al subir la imagen', error: error.message });
    }
}
