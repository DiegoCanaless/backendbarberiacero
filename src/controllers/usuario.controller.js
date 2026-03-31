import { query } from "../config/db.js"
import bcrypt from "bcrypt";



// POST

export const createBarber = async (req, res) => {
    try {
        const { name, apellido, email, password, telefono } = req.body

        if (!name || !apellido || !email || !password || !telefono) {
            return res.status(400).json({ message: "Todos los campos tienen que estar llenos" })
        }

        const [exist] = await query(
            "SELECT id_usuario FROM usuario WHERE email = ?",
            [email]
        )

        if (exist.length > 0) {
            return res.status(409).json({ message: "El correo ya esta registrado" })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await query(
            `INSERT INTO usuario (name, apellido, email, telefono, password, role)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [name, apellido, email, telefono, hashedPassword, "barber"]
        );

        res.status(201).json({
            message: "Usuario fue creado correctamente",
            id: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al crear el usuario" })
    }
}




// GET

export const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 15
        const search = (req.query.search || "").toString()

        const offset = (page - 1) * limit

        const [users] = await query(
            `SELECT id_usuario, name, apellido, email, telefono, role, estado 
            FROM usuario 
            WHERE role != 'barber' 
                AND role != 'admin'
                AND (name LIKE ? OR apellido LIKE ? OR email LIKE ?)
            ORDER BY estado = 'activo' DESC
            LIMIT ? OFFSET ?`,
            [`%${search}%`, `%${search}%`, `%${search}%` ,limit, offset]
        );

        const [[count]] = await query(
            `SELECT COUNT(*) as total 
            FROM usuario 
            WHERE role != 'barber' 
                AND role != 'admin'
                AND (name LIKE ? OR apellido LIKE ? OR email LIKE ?)`,
                [`%${search}%`, `%${search}%`, `%${search}%`]
            )


        const total = count.total

        const totalPages = Math.ceil(total / limit)

        res.json({
            data: users,
            pagination: {
                total,
                page,
                limit,
                totalPages
            }
        })
    
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Error al traer todos los usuarios" })
    }
}

export const getUserById = async (req, res) => {
    try {

        const { id } = req.params;

        const [rows] = await query(
            "SELECT id_usuario, name, apellido, telefono, email, role FROM usuario WHERE id_usuario = ?",
            [id]
        );


        if (rows.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" })
        }

        res.json(rows[0])
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener el usuario " })
    }
}



export const getBarberos = async (req, res) => {
    try {
        const [barbers] = await query(
            "SELECT id_usuario, name, apellido, telefono, email, estado FROM usuario WHERE role = 'barber' AND estado= 'activo'"
        );

        res.json(barbers)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener barberos" })
    }
};




// PUT

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params
        const { name, apellido, telefono, email } = req.body

        if (!name || !apellido || !telefono || !email) {
            return res.status(400).json({ message: "Faltan datos obligatorios" })
        }

        const [result] = await query(
            `UPDATE usuario
            SET name = ?, apellido = ?, telefono = ?, email = ?
            WHERE id_usuario = ?`,
            [name, apellido, telefono, email, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" })
        }

        res.json({ message: "Usuario actualizado correctamente" })

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al actualizar usuario" })
    }
}



// DELETE

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params

        const [result] = await query(
            "UPDATE usuario SET estado = 'oculto' WHERE id_usuario = ?",
            [id]
        )

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Usuario no encontrado"
            })
        }

        res.json({
            message: "Usuario eliminado correctamente"
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Error al eliminar usuario" })
    }
}