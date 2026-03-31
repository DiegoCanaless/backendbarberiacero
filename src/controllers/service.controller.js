import { query } from "../config/db.js"

export const getServices = async (req, res) => {
    try {
        const [services] = await query(
            `SELECT id_servicio, nombre, precio, duracion, estado FROM servicios ORDER BY estado`
        )

        res.json(services)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Error al obtener los servicios" })
    }
}

export const getServicesActivos = async (req, res) => {
    try {
        const [services] = await query(
            `SELECT id_servicio, nombre, precio, duracion, estado 
            FROM servicios 
            WHERE estado = 'activo'
            `
        )

        res.json(services)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Error al obtener los servicios activos" })
    }
}


export const createService = async (req, res) => {
    try {
        const { nombre, precio, duracion } = req.body

        if (!nombre || !precio || !duracion) {
            return res.status(400).json({ message: "Todos los campos tienen que estar llenos" })
        }

        const [result] = await query(
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
        res.status(500).json({ message: "Error al crear el servicio" })
    }
}


export const actualizarEstado = async (req, res) => {
    const { id } = req.params;

    try {
        const [servicio] = await query(
            `SELECT id_servicio FROM servicios WHERE id_servicio = ?`,
            [id]
        );

        if (servicio.length === 0) {
            return res.status(404).json({
                message: "Servicio no encontrado"
            });
        }

        await query(
            `UPDATE servicios
             SET estado = CASE
                WHEN estado = 'activo' THEN 'oculto'
                ELSE 'activo'
             END
             WHERE id_servicio = ?`,
            [id]
        );

        res.json({
            message: "Estado del servicio actualizado correctamente"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al cambiar el estado del servicio" });
    }
};



export const misServicios = async (req, res) => {
    const barberID = req.user.id

    try {
        const [result] = await query(
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
        res.status(500).json({ message: "Error al traer mis servicios" })
    }
}

export const guardarServiciosBarbero = async (req, res) => {
    const barberID = req.user.id;
    const { servicios } = req.body;

    if (!Array.isArray(servicios)) {
        return res.status(400).json({
            message: "Servicios inválidos"
        });
    }

    try {
        // 1️⃣ Desactivar todos
        await query(
            `UPDATE barbero_servicios
       SET estado = 'oculto'
       WHERE barberID = ?`,
            [barberID]
        );

        // 2️⃣ Activar o insertar
        for (const servicioID of servicios) {

            // 👉 verificar si ya existe
            const [existe] = await query(
                `SELECT id FROM barbero_servicios
         WHERE barberID = ? AND servicioID = ?`,
                [barberID, servicioID]
            );

            if (existe.length > 0) {
                // ✅ reactivar
                await query(
                    `UPDATE barbero_servicios
           SET estado = 'activo'
           WHERE barberID = ? AND servicioID = ?`,
                    [barberID, servicioID]
                );
            } else {
                // ✅ insertar nuevo
                await query(
                    `INSERT INTO barbero_servicios (barberID, servicioID, estado)
           VALUES (?, ?, 'activo')`,
                    [barberID, servicioID]
                );
            }
        }

        res.json({ message: "Servicios actualizados correctamente" });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al guardar los servicios del barbero"
        });
    }
};

