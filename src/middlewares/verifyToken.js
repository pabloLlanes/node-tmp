import jwt from 'jsonwebtoken';


export const verifyToken = (req, res, next) => {
    try {

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
        console.log("DECODED EN MIDDLEWARE: " + { decoded });

        req.user = decoded;
        next()
    } catch (error) {
        console.log(error)
        res.status(400).json({ success: false })
    }

}