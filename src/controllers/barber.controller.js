import pool from "../config/db.js"

export const getBarbers = async (req, res) => {
    try{
        const [barbers] = await pool.query(
            "SELECT id_cliente, name, apellido, telefono, email FROM usuario WHERE role = 'barber'"
        );

        res.json(barbers)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener barberos"})
    }
};


export const getServiciosByBarber = async (req, res) => {
    const { id } = req.params;

    try{
        const [servicios] = await pool.query(
            ` SELECT s.id_servicio, s.nombre, s.precio, s.duracion
              FROM servicios s
              INNER JOIN barbero_servicios bs
                ON s.id_servicio = bs.servicioID
                WHERE bs.barberID = ?
            `, [id]);

        res.json(servicios)
    } catch (error){
        res.status(500).json({
            message: "Error al obtener servicios del barbero"
        })
    }
}

