import pool from "../config/db.js";


export const crearHorario = async (req, res) => {
    const barberID = req.user.id;
    const { dia, horaInicio, horaFin } = req.body;

    if (!dia || !horaInicio || !horaFin) {
        return res.status(400).json({ message: "Datos Incompletos " })
    }


    try {
        await pool.query(
            `INSERT INTO horarioTrabajo (barberID, dia, horaInicio, horaFin, activo)
            VALUES (?, ?, ?, ?, ?)`,
            [barberID, dia, horaInicio, horaFin, true]
        )

        res.status(201).json({ message: "Horario creado correctamente" })

    } catch (error) {

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "Horario ya existente" })
        }

        console.error(error)
        return res.status(500).json({ message: "Error al traerme los horarios" })
    }
}


export const obtenerMisHorario = async (req, res) => {
    const barberID = req.user.id

    try {
        const [rows] = await pool.query(
            `SELECT * FROM horariotrabajo
            WHERE barberID = ?
            AND activo = true
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

export const desactivarHorario = async (req, res) => {
    const barberID = req.user.id;
    const { id } = req.params

    try {

        const [result] = await pool.query(
            `UPDATE horariotrabajo
             SET activo = false
             WHERE id_horario = ?
               AND barberID = ?
               AND activo = true`,
            [id, barberID]
        );

        if(result.affectedRows === 0){
            return res.status(404).json({ message: "Horario no encontrado o ya desactivado"})
        }

        res.json({ message: "Horario desactivado correctamente"})
        
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Error al desactivar el horario"})
    }
}