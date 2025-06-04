class BaseController {
    constructor(model) {
        this.model = model;
    }
    
    async getAll(req, res) {
        try {
            const items = await this.model.find();
            return res.json({
                success: true,
                count: items.length,
                data: items
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'Error del servidor',
                error: error.message
            });
        }
    }
    
    async getOne(req, res) {
        try {
            const item = await this.model.findById(req.params.id);
            
            if (!item) {
                return res.status(404).json({
                    success: false,
                    message: 'Recurso no encontrado'
                });
            }
            
            return res.json({
                success: true,
                data: item
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'Error del servidor',
                error: error.message
            });
        }
    }
    
    async create(req, res) {
        try {
            const newItem = await this.model.create(req.body);
            
            return res.status(201).json({
                success: true,
                message: 'Recurso creado exitosamente',
                data: newItem
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'Error al crear el recurso',
                error: error.message
            });
        }
    }
    
    async update(req, res) {
        try {
            const updatedItem = await this.model.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );
            
            if (!updatedItem) {
                return res.status(404).json({
                    success: false,
                    message: 'Recurso no encontrado'
                });
            }
            
            return res.json({
                success: true,
                message: 'Recurso actualizado exitosamente',
                data: updatedItem
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'Error al actualizar el recurso',
                error: error.message
            });
        }
    }
    
    async delete(req, res) {
        try {
            const deletedItem = await this.model.findByIdAndDelete(req.params.id);
            
            if (!deletedItem) {
                return res.status(404).json({
                    success: false,
                    message: 'Recurso no encontrado'
                });
            }
            
            return res.json({
                success: true,
                message: 'Recurso eliminado exitosamente',
                data: deletedItem
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'Error al eliminar el recurso',
                error: error.message
            });
        }
    }
}

export default BaseController;
