import pool from "../config/db.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: "Email y password son requeridos" })
        }

        const [rows] = await pool.query(
            "SELECT id_cliente, name, password, email, role FROM usuario WHERE email = ?",
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: "Credenciales son invalidas" })
        }

        const user = rows[0]
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: "Credenciales son invalidas" })
        }

        const token = jwt.sign(
            {
                id: user.id_cliente,
                role: user.role,
                name: user.name,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        const userInfo = {
            id_cliente: user.id_cliente,
            name: user.name,
            email: user.email,
            role: user.role
        }

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24
        })
            .json({
                user: userInfo,
                message: "Login exitoso",
            })


    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Error al Logearse" })
    }
}

export const register = async (req, res) => {
    try {
        const { name, apellido, email, password, telefono } = req.body

        if (!name || !apellido || !email || !password || !telefono) {
            return res.status(400).json({ message: "Todos los campos tienen que estar llenos" })
        }

        const [exist] = await pool.query(
            "SELECT id_cliente FROM usuario WHERE email = ?",
            [email]
        )

        if (exist.length > 0) {
            return res.status(409).json({ message: "El correo ya esta registrado" })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            `INSERT INTO usuario (name, apellido, email, telefono, password, role)
            VALUES(?, ?, ?, ?, ?, ?)`,
            [name, apellido, email, telefono, hashedPassword, "usuario"]
        )

        res.status(201).json({
            message: "Usuario registrado correctamente",
            id: result.insertId
        })


    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Error al registrarse " })
    }
}


export const logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
    })
        .json({ message: "Logout exitoso" })
}

export const me = (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "No autenticado" })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);


        res.json({
            id: decoded.id,
            role: decoded.role,
            name: decoded.name,
            email: decoded.email
        });

    } catch {
        return res.status(401).json({ message: "Token Invalido" })
    }
}