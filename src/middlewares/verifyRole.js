

export const verifyRole = (rolesPermitidos) => {
    return (req, res, next) => {
        const userRole = req.user.role;

        if(!rolesPermitidos.includes(userRole)) {
            return res.status(403).json({
                messgae: "No tenes permiso para esta accion"
            })
        }

        next();
    }
}