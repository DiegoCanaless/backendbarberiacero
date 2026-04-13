import { query } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// ================= LOGIN =================
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email y password son requeridos" });
        }

        const [rows] = await query(
            "SELECT * FROM usuario WHERE email = ?",
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        const user = rows[0];

        if (user.estado === "oculto") {
            return res.status(403).json({ message: "Usuario bloqueado" });
        }

        if (user.provider === "google") {
            return res.status(400).json({
                message: "Este usuario usa login con Google"
            });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        const token = jwt.sign(
            {
                id: user.id_usuario,
                role: user.role,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            user: {
                id_usuario: user.id_usuario,
                name: user.name,
                apellido: user.apellido,
                email: user.email,
                telefono: user.telefono,
                role: user.role,
                provider: user.provider,
                profile_complete: user.profile_complete
            },
            token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al logearse" });
    }
};

// ================= REGISTER =================
export const register = async (req, res) => {
    try {
        const { name, apellido, email, password, telefono } = req.body;

        if (!name || !apellido || !email || !password || !telefono) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        if (!/^\+?[1-9]\d{7,14}$/.test(telefono)) {
            return res.status(400).json({ message: "Telefono inválido" });
        }

        const [exist] = await query(
            "SELECT id_usuario FROM usuario WHERE email = ?",
            [email]
        );

        if (exist.length > 0) {
            return res.status(409).json({ message: "El correo ya está registrado" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await query(
            `INSERT INTO usuario (name, apellido, email, telefono, password, role, provider, profile_complete)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, apellido, email, telefono, hashedPassword, "usuario", "local", 1]
        );

        res.status(201).json({
            user: {
                id_usuario: result.lastInsertRowid,
                name,
                apellido,
                email,
                telefono,
                role: "usuario",
                profile_complete: 1
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al registrarse" });
    }
};

// ================= LOGOUT =================
export const logout = (req, res) => {
    // 👉 Ya no hay cookies
    res.json({ message: "Logout exitoso" });
};

// ================= ME =================
export const me = async (req, res) => {
    try {
        const userId = req.user.id;

        const [rows] = await query(
            "SELECT * FROM usuario WHERE id_usuario = ?",
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const user = rows[0];

        if (user.estado === "oculto") {
            return res.status(403).json({ message: "Usuario bloqueado" });
        }

        res.json({
            id_usuario: user.id_usuario,
            name: user.name,
            apellido: user.apellido,
            email: user.email,
            telefono: user.telefono,
            role: user.role,
            profile_complete: user.profile_complete
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obteniendo usuario" });
    }
};

// ================= GOOGLE AUTH =================
export const googleAuth = async (req, res) => {
    try {
        const { name, email, google_id } = req.body;

        if (!email || !google_id) {
            return res.status(400).json({ message: "Datos incompletos" });
        }

        const [rows] = await query(
            "SELECT * FROM usuario WHERE email = ?",
            [email]
        );

        let user;

        if (rows.length === 0) {
            const [result] = await query(
                `INSERT INTO usuario (name, email, provider, google_id, role, profile_complete)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [name, email, "google", google_id, "usuario", 0]
            );

            const [newUser] = await query(
                "SELECT * FROM usuario WHERE id_usuario = ?",
                [result.lastInsertRowid]
            );

            user = newUser[0];

        } else {
            user = rows[0];

            if (!user.google_id) {
                await query(
                    "UPDATE usuario SET google_id = ?, provider = 'google' WHERE id_usuario = ?",
                    [google_id, user.id_usuario]
                );
            }
        }

        const token = jwt.sign(
            {
                id: user.id_usuario,
                role: user.role,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            user: {
                id_usuario: user.id_usuario,
                name: user.name,
                apellido: user.apellido,
                email: user.email,
                telefono: user.telefono,
                role: user.role,
                profile_complete: user.profile_complete
            },
            token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error en auth Google" });
    }
};

// ================= COMPLETAR PERFIL =================
export const completarPerfil = async (req, res) => {
    try {
        const { telefono } = req.body;
        const userId = req.user.id;

        if (!/^\+[1-9]\d{7,14}$/.test(telefono)) {
            return res.status(400).json({ message: "Telefono inválido" });
        }

        await query(
            `UPDATE usuario 
             SET telefono = ?, profile_complete = 1 
             WHERE id_usuario = ?`,
            [telefono, userId]
        );

        const [rows] = await query(
            "SELECT * FROM usuario WHERE id_usuario = ?",
            [userId]
        );

        const user = rows[0];

        res.json({
            user: {
                id_usuario: user.id_usuario,
                name: user.name,
                apellido: user.apellido,
                email: user.email,
                telefono: user.telefono,
                role: user.role,
                profile_complete: user.profile_complete
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error completando perfil" });
    }
};
