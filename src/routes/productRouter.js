import { Router } from "express";
import { check, param } from 'express-validator';
import { handleValidationErrors } from "../middlewares/validationMiddleware.js";
import { getProducts, createProduct, deleteProduct } from "../controllers/productController.js";

const userRouter = Router();

userRouter.get("/", getProducts)

userRouter.post("/", createProduct)

userRouter.delete("/:id", deleteProduct)

/* 
userRouter.get("/:id", getProduct)

*/


export default userRouter;