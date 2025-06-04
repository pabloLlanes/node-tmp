import { Router } from "express";
import { check, param } from 'express-validator';
import { handleValidationErrors } from "../middlewares/validationMiddleware.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { 
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    patchCategory,
    deleteCategory,
    getProductsByCategory
} from "../controllers/categoryController.js";

const categoryRouter = Router();

categoryRouter.get("/", getCategories);

categoryRouter.get("/:id", [
    param('id').isMongoId().withMessage('ID de categoría no válido'),
    handleValidationErrors
], getCategoryById);

categoryRouter.get("/:id/products", [
    param('id').isMongoId().withMessage('ID de categoría no válido'),
    handleValidationErrors
], getProductsByCategory);

categoryRouter.post("/", [
    check('name').notEmpty().withMessage('El nombre de la categoría es obligatorio'),
    handleValidationErrors,
    verifyToken
], createCategory);

categoryRouter.put("/:id", [
    param('id').isMongoId().withMessage('ID de categoría no válido'),
    check('name').notEmpty().withMessage('El nombre de la categoría es obligatorio'),
    handleValidationErrors,
    verifyToken
], updateCategory);

categoryRouter.patch("/:id", [
    param('id').isMongoId().withMessage('ID de categoría no válido'),
    handleValidationErrors,
    verifyToken
], patchCategory);

categoryRouter.delete("/:id", [
    param('id').isMongoId().withMessage('ID de categoría no válido'),
    handleValidationErrors,
    verifyToken
], deleteCategory);

export default categoryRouter;
