import { query } from "../config/db.js"


export const crearHorario = async (req, res) => {
    const barberID = req.user.id;
    const horarios = req.body;

    if (!Array.isArray(horarios)) {
        return res.status(400).json({ message: "No hay horarios para guardar" });
    }

    try {
        // 1️⃣ Desactivar todos
        await query(
            `UPDATE horariotrabajo
             SET estado = 'oculto'
             WHERE barberID = ?`,
            [barberID]
        );

        // 2️⃣ Reactivar o insertar
        for (const h of horarios) {
            const { dia, horaInicio, horaFin } = h;

            if (!dia || !horaInicio || !horaFin) continue;

            if (horaInicio >= horaFin) {
                return res.status(400).json({
                    message: `Error en ${dia}: horaInicio debe ser menor a horaFin`
                });
            }

            // 🔍 Verificar si ya existe ese día
            const [existe] = await query(
                `SELECT id_horario
                 FROM horariotrabajo
                 WHERE barberID = ? AND dia = ?`,
                [barberID, dia]
            );

            if (existe.length > 0) {
                // ✅ actualizar y activar
                await query(
                    `UPDATE horariotrabajo
                     SET horaInicio = ?, horaFin = ?, estado = 'activo'
                     WHERE barberID = ? AND dia = ?`,
                    [horaInicio, horaFin, barberID, dia]
                );
            } else {
                // ✅ insertar
                await query(
                    `INSERT INTO horariotrabajo 
                     (barberID, dia, horaInicio, horaFin, estado)
                     VALUES (?, ?, ?, ?, 'activo')`,
                    [barberID, dia, horaInicio, horaFin]
                );
            }
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
        const [rows] = await query(
            `SELECT * FROM horariotrabajo
             WHERE barberID = ?
             AND estado = 'activo'
             ORDER BY 
                CASE dia
                    WHEN 'lunes' THEN 1
                    WHEN 'martes' THEN 2
                    WHEN 'miercoles' THEN 3
                    WHEN 'jueves' THEN 4
                    WHEN 'viernes' THEN 5
                    WHEN 'sabado' THEN 6
                    WHEN 'domingo' THEN 7
                END,
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
    const { id } = req.params;

    try {
        // 🔍 Verificar existencia
        const [horario] = await query(
            `SELECT id_horario FROM horariotrabajo
             WHERE id_horario = ? AND barberID = ?`,
            [id, barberID]
        );

        if (horario.length === 0) {
            return res.status(404).json({ message: "Horario no encontrado" });
        }

        // 🔁 Toggle estado
        await query(
            `UPDATE horariotrabajo
             SET estado = CASE
                WHEN estado = 'activo' THEN 'oculto'
                ELSE 'activo'
             END
             WHERE id_horario = ? AND barberID = ?`,
            [id, barberID]
        );

        res.json({ message: "Estado del horario actualizado correctamente" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al actualizar el horario" });
    }
};
