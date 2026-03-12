import pool from "../config/db.js"

export const getBarbers = async (req, res) => {
    try {
        const [barbers] = await pool.query(
            "SELECT id_cliente, name, apellido, telefono, email FROM usuario WHERE role = 'barber' AND estado = 'activo'"
        );

        res.json(barbers)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener barberos" })
    }
};


export const getServiciosByBarber = async (req, res) => {
    const { id } = req.params;

    try {
        const [servicios] = await pool.query(
            `SELECT s.id_servicio, s.nombre, s.precio, s.duracion
             FROM servicios s
             JOIN barbero_servicios bs ON s.id_servicio = bs.servicioID
             JOIN usuario u ON bs.barberID = u.id_cliente
             WHERE bs.barberID = ?
             AND bs.estado = 'activo'
             AND s.estado = 'activo'
             AND u.estado = 'activo'`,
            [id]
        );

        if (isNaN(id)) {
            return res.status(400).json({ message: "ID inválido" })
        }


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

        const [rows] = await pool.query(
            `SELECT dia, horaInicio, horaFin
            FROM horariotrabajo
            WHERE barberID = ?
            ORDER BY FIELD(
                dia,
                'lunes',
                'martes',
                'miercoles',
                'jueves',
                'viernes',
                'sabado',
                'domingo'
            )
`,
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


