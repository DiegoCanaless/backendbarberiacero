import pool from "../config/db.js";


export const crearHorario = async (req, res) => {
    const barberID = req.user.id;
    const horarios = req.body;

    if (!Array.isArray(horarios)) {
        return res.status(400).json({ message: "No hay horarios para guardar" });
    }

    try {
        await pool.query(
            `UPDATE horariotrabajo
             SET activo = 'oculto'
             WHERE barberID = ?`,
            [barberID]
        );

        for (const h of horarios) {
            const { dia, horaInicio, horaFin } = h;

            if (!dia || !horaInicio || !horaFin) continue;

            if (horaInicio >= horaFin) {
                return res.status(400).json({
                    message: `Error en ${dia}: horaInicio debe ser menor a horaFin`
                });
            }

            await pool.query(
                `INSERT INTO horariotrabajo (barberID, dia, horaInicio, horaFin, activo)
                 VALUES (?, ?, ?, ?, 'activo')
                 ON DUPLICATE KEY UPDATE 
                    horaInicio = VALUES(horaInicio),
                    horaFin = VALUES(horaFin),
                    activo = true`,
                [barberID, dia, horaInicio, horaFin]
            );
        }

        res.json({ message: "Horarios guardados correctamente" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al guardar horarios" });
    }
};


export const obtenerMisHorario = async (req, res) => {
    const barberID = req.user.id

    try {
        const [rows] = await pool.query(
            `SELECT * FROM horariotrabajo
            WHERE barberID = ?
            AND activo = 'activo'
            ORDER BY FIELD(dia,'lunes','martes','miercoles','jueves','viernes','sabado','domingo'),
                horaInicio`,
            [barberID]
        );

        res.json(rows)

    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Error al traerme mis horarios" })
    }
}

export const toggleHorario = async (req, res) => {
    const barberID = req.user.id;
    const { id } = req.params

    try {

        const [result] = await pool.query(
            `UPDATE horariotrabajo
             SET estado = CASE
                WHEN estado = 'activo' THEN 'oculto'
                ELSE 'activo'
            END
            WHERE id_horario = ?
            AND barberID = ?`,
            [id, barberID]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Horario no encontrado" })
        }

        res.json({ message: "Estado del horario actualizado correctamente" })

    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Error al actualizar el horario" })
    }
}