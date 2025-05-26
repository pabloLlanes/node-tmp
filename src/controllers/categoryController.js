import Category from "../models/Category.js";
import Product from "../models/Product.js";

// Obtener todas las categorías
export const getCategories = async (req, res) => {
    try {
        // Parámetros de paginación
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Obtener categorías con paginación
        const categories = await Category.find()
            .skip(skip)
            .limit(limit)
            .sort({ name: 1 });
        
        // Contar total de categorías para la paginación
        const total = await Category.countDocuments();
        
        res.json({ 
            success: true, 
            count: categories.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            categories 
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Error al obtener categorías', error: error.message });
    }
};

// Obtener una categoría por ID
export const getCategoryById = async (req, res) => {
    try {
        const categoryId = req.params.id;
        
        const category = await Category.findById(categoryId);
        
        if (!category) {
            return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
        }
        
        res.json({ success: true, category });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Error al obtener la categoría', error: error.message });
    }
};

// Crear una nueva categoría
export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Verificar si ya existe una categoría con el mismo nombre
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ success: false, message: 'Ya existe una categoría con ese nombre' });
        }

        const newCategory = await Category.create({
            name, 
            description,
            creator: req.user ? req.user._id : null
        });

        res.status(201).json({ success: true, category: newCategory });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Error al crear la categoría', error: error.message });
    }
};

// Actualizar una categoría
export const updateCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const { name, description, isActive } = req.body;
        
        const category = await Category.findById(categoryId);
        
        if (!category) {
            return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
        }
        
        // Verificar si ya existe otra categoría con el mismo nombre
        if (name && name !== category.name) {
            const existingCategory = await Category.findOne({ name });
            if (existingCategory) {
                return res.status(400).json({ success: false, message: 'Ya existe otra categoría con ese nombre' });
            }
        }
        
        const updatedCategory = await Category.findByIdAndUpdate(
            categoryId,
            { name, description, isActive },
            { new: true }
        );
        
        res.json({ success: true, category: updatedCategory });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Error al actualizar la categoría', error: error.message });
    }
};

// Actualizar parcialmente una categoría (PATCH)
export const patchCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const updates = req.body;
        
        const category = await Category.findById(categoryId);
        
        if (!category) {
            return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
        }
        
        // Verificar si se está intentando actualizar el nombre
        if (updates.name && updates.name !== category.name) {
            const existingCategory = await Category.findOne({ name: updates.name });
            if (existingCategory) {
                return res.status(400).json({ success: false, message: 'Ya existe otra categoría con ese nombre' });
            }
        }
        
        const updatedCategory = await Category.findByIdAndUpdate(
            categoryId,
            { $set: updates },
            { new: true }
        );
        
        res.json({ 
            success: true, 
            message: 'Categoría actualizada parcialmente',
            category: updatedCategory 
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Error al actualizar parcialmente la categoría', error: error.message });
    }
};

// Eliminar una categoría
export const deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        
        const category = await Category.findById(categoryId);
        
        if (!category) {
            return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
        }
        
        // Verificar si hay productos asociados a esta categoría
        const productsWithCategory = await Product.countDocuments({ category: categoryId });
        
        if (productsWithCategory > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `No se puede eliminar la categoría porque tiene ${productsWithCategory} productos asociados` 
            });
        }
        
        await Category.findByIdAndDelete(categoryId);

        res.json({ success: true, message: `Categoría con ID: ${categoryId} eliminada correctamente` });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Error al eliminar la categoría', error: error.message });
    }
};

// Obtener productos por categoría
export const getProductsByCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        
        // Verificar si la categoría existe
        const category = await Category.findById(categoryId);
        
        if (!category) {
            return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
        }
        
        // Parámetros de paginación
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Obtener productos de esta categoría
        const products = await Product.find({ category: categoryId })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        
        // Contar total de productos para la paginación
        const total = await Product.countDocuments({ category: categoryId });
        
        res.json({ 
            success: true, 
            count: products.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            category,
            products 
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Error al obtener productos por categoría', error: error.message });
    }
};
