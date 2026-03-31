import { query } from "../config/db.js"

export const getBarbers = async (req, res) => {
    try {
        const [barbers] = await query(
            "SELECT id_usuario, name, apellido, telefono, email, estado FROM usuario WHERE role = 'barber'"
        );

        res.json(barbers)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener barberos" })
    }
};


export const getServiciosByBarber = async (req, res) => {
    const { id } = req.params;

    if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" })
    }

    try {
        const [servicios] = await query(
            `SELECT s.id_servicio, s.nombre, s.precio, s.duracion
             FROM servicios s
             JOIN barbero_servicios bs ON s.id_servicio = bs.servicioID
             JOIN usuario u ON bs.barberID = u.id_usuario
             WHERE bs.barberID = ?
             AND bs.estado = 'activo'
             AND s.estado = 'activo'
             AND u.estado = 'activo'`,
            [id]
        );




        res.json(servicios)
    } catch (error) {
        res.status(500).json({
            message: "Error al obtener servicios del barbero"
        })
    }
}

export const getHorarioBarbero = async (req, res) => {
    const { id } = req.params;

    try {

        const [rows] = await query(
            `SELECT dia, horaInicio, horaFin
            FROM horariotrabajo
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
        END`,
            [id]
        );


        res.json(rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener horarios del barbero"
        });
    }
};


