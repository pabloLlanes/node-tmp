import { Router } from "express";
import { createUser, getUsers, getUser, deleteUser, updateUser, login } from "../controllers/userController.js";
import { check, param } from 'express-validator';
import { handleValidationErrors } from "../middlewares/validationMiddleware.js";
import { checkUser } from "../middlewares/checkUserMiddleware.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyAdminRole } from "../middlewares/verifyAdminRole.js";

const userRouter = Router();


userRouter.post("/login",
    [
        check('email', 'El email es obligatorio | EV').isEmail().normalizeEmail(),
        check('password', 'El password es obligatorio | EV').not().isEmpty()
    ],
    handleValidationErrors,

    login
)

userRouter.get("/", getUsers)

userRouter.get("/:id",
    [
        param('id', 'El id proporcionado no es de mongodb, fijate bien').isMongoId()
    ],
    handleValidationErrors
    ,
    checkUser,
    getUser)

userRouter.post("/",
    [
        check('name', 'El nombre es obligatorio | EV').not().isEmpty().trim(),
        check('email', 'El email es obligatorio | EV').isEmail().normalizeEmail(),
        check('password', 'El password es obligatorio | EV').not().isEmpty()
    ],
    handleValidationErrors,
    verifyToken,
    verifyAdminRole,
    createUser
)

userRouter.delete("/:id",
    [
        param('id', 'El id proporcionado no es de mongodb, fijate bien').isMongoId()
    ],
    handleValidationErrors,
    verifyToken,
    verifyAdminRole,
    deleteUser
)

userRouter.put("/:id", [
    param('id', 'El id proporcionado no es de mongodb, fijate bien').isMongoId()
]
    ,
    handleValidationErrors
    , updateUser)


export default userRouter;