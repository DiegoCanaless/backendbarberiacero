import pool from "../config/db.js";
import bcrypt from "bcrypt";



// POST

export const createBarber = async (req, res) => {
    try {
        const { name, apellido, email, password, telefono } = req.body

        if(!name || !apellido || !email || !password || !telefono){
            return res.status(400).json({ message: "Todos los campos tienen que estar llenos"})
        }

        const [exist] = await pool.query(
            "SELECT id_cliente FROM usuario WHERE email = ?",
            [email]
        )

        if(exist.length> 0){
            return res.status(409).json({ message: "El correo ya esta registrado" })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
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
        const [users] = await pool.query(
            "SELECT id_cliente, name, apellido, email, telefono, role FROM usuario WHERE estado = 'activo'"
        );

        res.json(users)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Error al traer todos los usuarios" })
    }
}

export const getUserById = async (req, res) => {
    try {

        const { id } = req.params;

        const [rows] = await pool.query(
            "SELECT id_cliente, name, apellido, telefono, email, role FROM usuario WHERE id_cliente = ?",
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


// PUT

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params
        const { name, apellido, telefono, email } = req.body

        if(!name || !apellido || !telefono || !email) {
            return res.status(400).json({ message: "Faltan datos obligatorios"})
        }

        const [result] = await pool.query(
            `UPDATE usuario
            SET name = ?, apellido = ?, telefono = ?, email = ?
            WHERE id_cliente = ?`,
            [name, apellido, telefono, email, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Usuario no encontrado"})
        }

        res.json({ message: "Usuario actualizado correctamente"})

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al actualizar usuario"})
    }
}


// DELETE

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params

        const [result] = await pool.query(
            "UPDATE usuario SET estado = 'oculto' WHERE id_cliente = ?",
            [id]
        )

        if(result.affectedRows === 0){
            return res.status(404).json({ 
                message: "Usuario no encontrado"
            })
        }

        res.json({
            message: "Usuario eliminado correctamente"
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Error al eliminar usuario"})
    }
}