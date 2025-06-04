import { Router } from "express";
import {
    login,
    createUser
} from "../controllers/userController.js";
import { check } from 'express-validator';
import { handleValidationErrors } from "../middlewares/validationMiddleware.js";

const authRouter = Router();

authRouter.post("/login",
    [
        check('email', 'El email es obligatorio | EV').isEmail().normalizeEmail(),
        check('password', 'El password es obligatorio | EV').not().isEmpty()
    ],
    handleValidationErrors,
    login
);

authRouter.post("/register",
    [
        check('name', 'El nombre es obligatorio | EV').not().isEmpty().trim(),
        check('email', 'El email es obligatorio | EV').isEmail().normalizeEmail(),
        check('password', 'El password es obligatorio | EV').not().isEmpty()
    ],
    handleValidationErrors,
    createUser
);

export default authRouter;
