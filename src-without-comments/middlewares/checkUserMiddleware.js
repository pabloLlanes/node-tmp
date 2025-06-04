import User from "../models/User.js";

export const checkUser = async (req, res, next) => {

    const userId = req.params.id;

    const user = await User.findById(userId)

    console.log(user)

    if (!user) {
        res.status(404).json({ message: "che el user no existe" })
    }

    next()
}
