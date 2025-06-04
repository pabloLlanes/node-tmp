import BaseController from './BaseController.js';
import Product from '../models/ProductModel.js';
import Category from '../models/CategoryModel.js';
import { FileUploader } from '../config/multer.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export class ProductController extends BaseController {
    constructor() {
        super(Product);
        this.__filename = fileURLToPath(import.meta.url);
        this.__dirname = path.dirname(this.__filename);
        this.fileUploader = new FileUploader('products');
    }

    getUploader() {
        return this.fileUploader.getSingleUploader();
    }

    async getProducts(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const filter = {};

            // Aplicar filtros si existen
            if (req.query.category) {
                filter.category = req.query.category;
            }

            if (req.query.available === 'true') {
                filter.isAvailable = true;
            } else if (req.query.available === 'false') {
                filter.isAvailable = false;
            }

            const products = await Product.find(filter)
                .populate('category', 'name')
                .populate('creator', 'username email')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            const total = await Product.countDocuments(filter);

            return res.json({
                success: true,
                count: products.length,
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                products
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener productos',
                error: error.message
            });
        }
    }

    async getProduct(req, res) {
        try {
            const product = await Product.findById(req.params.id)
                .populate('category', 'name')
                .populate('creator', 'username email');

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            return res.json({
                success: true,
                product
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener el producto',
                error: error.message
            });
        }
    }

    async createProduct(req, res) {
        try {
            const { name, description, price, stock, category } = req.body;
            
            // Verificar si la categoría existe
            if (category) {
                const categoryExists = await Category.findById(category);
                if (!categoryExists) {
                    return res.status(404).json({
                        success: false,
                        message: 'La categoría especificada no existe'
                    });
                }
            }
            
            // Preparar el objeto de producto
            const productData = {
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock),
                category,
                creator: req.user._id
            };
            
            // Si hay una imagen subida
            if (req.file) {
                productData.image = `/uploads/products/${req.file.filename}`;
            }
            
            const newProduct = await Product.create(productData);
            
            return res.status(201).json({
                success: true,
                message: 'Producto creado exitosamente',
                product: newProduct
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'Error al crear el producto',
                error: error.message
            });
        }
    }

    async updateProduct(req, res) {
        try {
            const productId = req.params.id;
            const { name, description, price, stock, isAvailable, category } = req.body;
            
            // Verificar si el producto existe
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }
            
            // Verificar permisos
            if (product.creator && 
                product.creator.toString() !== req.user._id.toString() && 
                req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permiso para actualizar este producto'
                });
            }
            
            // Verificar si la categoría existe
            if (category) {
                const categoryExists = await Category.findById(category);
                if (!categoryExists) {
                    return res.status(404).json({
                        success: false,
                        message: 'La categoría especificada no existe'
                    });
                }
            }
            
            // Preparar datos de actualización
            const updateData = {
                name,
                description,
                price: price !== undefined ? parseFloat(price) : product.price,
                stock: stock !== undefined ? parseInt(stock) : product.stock,
                isAvailable: isAvailable !== undefined ? isAvailable : product.isAvailable,
                category: category || product.category
            };
            
            // Si hay una imagen nueva, manejarla
            if (req.file) {
                // Eliminar imagen anterior si no es la default
                if (product.image && !product.image.includes('default.jpg')) {
                    const imagePath = path.join(this.__dirname, '../../', product.image);
                    if (fs.existsSync(imagePath)) {
                        fs.unlinkSync(imagePath);
                    }
                }
                
                updateData.image = `/uploads/products/${req.file.filename}`;
            }
            
            const updatedProduct = await Product.findByIdAndUpdate(
                productId,
                updateData,
                { new: true, runValidators: true }
            ).populate('category', 'name');
            
            return res.json({
                success: true,
                message: 'Producto actualizado exitosamente',
                product: updatedProduct
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'Error al actualizar el producto',
                error: error.message
            });
        }
    }

    async deleteProduct(req, res) {
        try {
            const productId = req.params.id;
            
            // Verificar si el producto existe
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }
            
            // Verificar permisos
            if (product.creator && 
                product.creator.toString() !== req.user._id.toString() && 
                req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permiso para eliminar este producto'
                });
            }
            
            // Eliminar la imagen si no es la default
            if (product.image && !product.image.includes('default.jpg')) {
                const imagePath = path.join(this.__dirname, '../../', product.image);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
            
            await Product.findByIdAndDelete(productId);
            
            return res.json({
                success: true,
                message: 'Producto eliminado exitosamente',
                product
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'Error al eliminar el producto',
                error: error.message
            });
        }
    }

    async searchProducts(req, res) {
        try {
            const { term } = req.query;
            
            if (!term) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requiere un término de búsqueda'
                });
            }
            
            const regex = new RegExp(term, 'i');
            
            const products = await Product.find({
                $or: [
                    { name: regex },
                    { description: regex }
                ]
            })
            .populate('category', 'name')
            .populate('creator', 'username email')
            .sort({ createdAt: -1 });
            
            return res.json({
                success: true,
                count: products.length,
                products
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'Error al buscar productos',
                error: error.message
            });
        }
    }
}
