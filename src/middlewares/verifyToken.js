import jwt from 'jsonwebtoken';


export const verifyToken = (req, res, next) => {

    const authHeader = req.header('Authorization');
    console.log("TOKEN: " + req.header('Authorization'))

    console.log({ authHeader });

    if (!authHeader) {
        return res.status(501).json({ success: false, message: "invalid token" })
    }

    const decoded = jwt.verify(authHeader, process.env.JWT_SECRET)

    if (!decoded) {
        return res.status(501).json({ success: false, message: "error token" })
    }
    console.log(decoded);

    req.user = decoded;

    next()
}