import pool from "../config/db.js";

export const getServices = async (req, res) => {
    try{
        const [services] = await pool.query(
            `SELECT id_servicio, nombre, precio, duracion, estado FROM servicios ORDER BY estado`
        )

        res.json(services)
    } catch(error){
        console.error(error)
        res.status(500).json({ message: "Error al obtener los servicios"})
    }
}

export const getServicesActivos = async (req, res) => {
    try{
        const [services] = await pool.query(
            `SELECT id_servicio, nombre, precio, duracion, estado 
            FROM servicios 
            WHERE estado = 'activo'
            `
        )

        res.json(services)
    } catch(error){
        console.error(error)
        res.status(500).json({ message: "Error al obtener los servicios activos"})
    }
}


export const createService = async (req,res) => {
    try {
        const { nombre, precio, duracion } = req.body

        if (!nombre || !precio || !duracion){
            return res.status(400).json({ message :"Todos los campos tienen que estar llenos"})
        }

        const [result] = await pool.query(
            `INSERT INTO servicios (nombre, precio, duracion)
            VALUES (?,?,?)`,
            [nombre, precio, duracion]
        )

        res.status(201).json({
            message: "Servicio creado correctamente",
            id: result.insertId
        })
    } catch (error) {
        console.error(error)    
        res.status(500).json({ message: "Error al crear el servicio"})
    }
}


export const actualizarEstado = async (req, res) => {
    const { id } = req.params

    try {
        const [result] = await pool.query(
            `UPDATE servicios
            SET estado = CASE
                WHEN estado = 'activo' THEN 'oculto'
                ELSE 'activo'
            END
            WHERE id_servicio = ?`,
            [id]
        );

        if(result.affectedRows === 0) {
            return res.status(404).json({
                message: "Servicio no encontrado"
            })
        }

        res.json({
            message: "Estado del servicio actualizado correctamente"
        })
        
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Error al cambiar el estado del servicio"})
    }
}


export const misServicios = async (req, res) => {
    const barberID = req.user.id

    try {
        const [result] = await pool.query(
            `SELECT s.id_servicio, s.nombre, s.precio, s.duracion
            FROM barbero_servicios bs
            JOIN servicios s ON bs.servicioID = s.id_servicio
            WHERE bs.barberID = ?
            AND bs.estado = 'activo'
            `,
            [barberID]
        )

        res.json(result)


    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Error al traer mis servicios"})
    }
}

export const guardarServiciosBarbero = async (req, res) => {
    const barberID = req.user.id
    const { servicios } = req.body
    
    if(!Array.isArray(servicios)){
        return res.status(400).json({
            message: "Servicios invalidos"
        })
    }

    try {
        await pool.query(
            `UPDATE barbero_servicios
            SET estado = 'inactivo'
            WHERE barberID = ?`,
            [barberID]
        )

        for (const servicioID of servicios){
            await pool.query(
                `
                    INSERT INTO barbero_servicios (barberID, servicioID, estado)
                    VALUES (?, ?, 'activo')
                    ON DUPLICATE KEY UPDATE estado = 'activo'`,
                    [barberID, servicioID]
            )
        }

        res.json({ message: "Servicios actualizados correctamente"})


    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Error al guardar los servicios del barbero"})
    }

}