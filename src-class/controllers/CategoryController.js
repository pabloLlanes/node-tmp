import BaseController from './BaseController.js';
import Category from '../models/CategoryModel.js';
import Product from '../models/ProductModel.js';

export class CategoryController extends BaseController {
    constructor() {
        super(Category);
    }

    async getCategories(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const categories = await Category.find()
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            const total = await Category.countDocuments();

            return res.json({
                success: true,
                count: categories.length,
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                categories
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener categorías',
                error: error.message
            });
        }
    }

    async getCategory(req, res) {
        try {
            const category = await Category.findById(req.params.id);

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoría no encontrada'
                });
            }

            return res.json({
                success: true,
                category
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener la categoría',
                error: error.message
            });
        }
    }

    async createCategory(req, res) {
        try {
            const { name, description } = req.body;

            const existingCategory = await Category.findOne({ name });
            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe una categoría con ese nombre'
                });
            }

            const newCategory = await Category.create({
                name,
                description
            });

            return res.status(201).json({
                success: true,
                message: 'Categoría creada exitosamente',
                category: newCategory
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'Error al crear la categoría',
                error: error.message
            });
        }
    }

    async updateCategory(req, res) {
        try {
            const { name, description } = req.body;
            
            if (name) {
                const existingCategory = await Category.findOne({ 
                    name, 
                    _id: { $ne: req.params.id } 
                });
                
                if (existingCategory) {
                    return res.status(400).json({
                        success: false,
                        message: 'Ya existe otra categoría con ese nombre'
                    });
                }
            }
            
            const updatedCategory = await Category.findByIdAndUpdate(
                req.params.id,
                { name, description },
                { new: true, runValidators: true }
            );

            if (!updatedCategory) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoría no encontrada'
                });
            }

            return res.json({
                success: true,
                message: 'Categoría actualizada exitosamente',
                category: updatedCategory
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'Error al actualizar la categoría',
                error: error.message
            });
        }
    }

    async deleteCategory(req, res) {
        try {
            const categoryId = req.params.id;
            
            const productsWithCategory = await Product.countDocuments({ category: categoryId });
            
            if (productsWithCategory > 0) {
                return res.status(400).json({
                    success: false,
                    message: `No se puede eliminar la categoría porque tiene ${productsWithCategory} productos asociados`
                });
            }
            
            const deletedCategory = await Category.findByIdAndDelete(categoryId);
            
            if (!deletedCategory) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoría no encontrada'
                });
            }
            
            return res.json({
                success: true,
                message: 'Categoría eliminada exitosamente',
                category: deletedCategory
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'Error al eliminar la categoría',
                error: error.message
            });
        }
    }
}
