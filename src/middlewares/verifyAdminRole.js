

export const verifyAdminRole = (req, res, next) => {

    const user = req.user;
    console.log(user)

    if (user.role !== "ADMIN_ROLE") {
        return res.json({ success: false, message: "you need admin role" })
    }

    next()
}