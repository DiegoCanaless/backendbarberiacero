

export const verifyRole = (rolesPermitidos) => {
    return (req, res, next) => {
        const userRole = req.user.role.toLowerCase();

        if(!rolesPermitidos.includes(userRole)) {
            return res.status(403).json({
                message: "No tenes permiso para esta accion"
            })
        }

        next();
    }
}