import jwt  from "jsonwebtoken"

export const verifyToken = (req, res, next) => {
    const token = req.cookies.token;

    if(!token){
        return res.status(401).json({ message: "Token requerido"})
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded
        next();
    } catch (error){
        console.error(error)
        return req.status(401).json({ message: "Token invalido"})
    }
}

export default verifyToken