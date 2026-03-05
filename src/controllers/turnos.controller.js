import pool from "../config/db.js";
import { generarHorarios } from "../utils/generarHorarios.js";

/* ============================= */
/*      GET TURNOS BARBERO      */
/* ============================= */

export const getTurnosByBarber = async (req, res) => {
  const barberID = req.user.id;

  try {
    const [rows] = await pool.query(
      `SELECT * FROM turnos 
       WHERE barberID = ?
       ORDER BY fecha, horario`,
      [barberID]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al traer turnos" });
  }
};

/* ============================= */
/*      GET TURNOS USUARIO      */
/* ============================= */

export const getTurnosByUser = async (req, res) => {
  const clienteID = req.user.id;

  try {
    const [rows] = await pool.query(
      `SELECT * FROM turnos 
       WHERE clienteID = ?
       ORDER BY fecha, horario`,
      [clienteID]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al traer turnos" });
  }
};

/* ============================= */
/*         CREAR TURNO          */
/* ============================= */

export const crearTurno = async (req, res) => {
  const { barberID, servicioID, fecha, horario } = req.body;
  const clienteID = req.user.id;

  if (!barberID || !servicioID || !fecha || !horario) {
    return res.status(400).json({
      message: "Todos los campos son obligatorios"
    });
  }

  const horarioDB = horario.length === 5 ? `${horario}:00` : horario;

  try {

    // 1️⃣ Verificar que el servicio exista y traer duración
    const [servicio] = await pool.query(
      `SELECT duracion 
       FROM servicios 
       WHERE id_servicio = ?`,
      [servicioID]
    );

    if (servicio.length === 0) {
      return res.status(404).json({
        message: "Servicio no encontrado"
      });
    }

    const duracion = servicio[0].duracion;

    // 2️⃣ Verificar que el barbero haga ese servicio
    const [barberoServicio] = await pool.query(
      `SELECT 1
       FROM barbero_servicios
       WHERE barberID = ?
       AND servicioID = ?`,
      [barberID, servicioID]
    );

    if (barberoServicio.length === 0) {
      return res.status(400).json({
        message: "Este barbero no realiza ese servicio"
      });
    }

    // 3️⃣ Calcular horaFin
    const inicio = new Date(`${fecha}T${horarioDB}`);
    const fin = new Date(inicio.getTime() + duracion * 60000);
    const horaFin = fin.toTimeString().slice(0, 8);

    // 4️⃣ Validar que esté dentro del horario laboral del barbero
    const dias = [
      "domingo",
      "lunes",
      "martes",
      "miercoles",
      "jueves",
      "viernes",
      "sabado"
    ];

    const dia = dias[new Date(`${fecha}T00:00:00`).getDay()];

    const [horarios] = await pool.query(
      `SELECT horaInicio, horaFin
       FROM horariotrabajo
       WHERE barberID = ?
       AND dia = ?
       AND activo = true`,
      [barberID, dia]
    );

    if (horarios.length === 0) {
      return res.status(400).json({
        message: "El barbero no trabaja ese día"
      });
    }

    const dentroDeHorario = horarios.some(h => {
      return horarioDB >= h.horaInicio && horaFin <= h.horaFin;
    });

    if (!dentroDeHorario) {
      return res.status(400).json({
        message: "El turno está fuera del horario laboral"
      });
    }

    // 5️⃣ Validar solapamiento real
    const [solapado] = await pool.query(
      `SELECT 1
       FROM turnos
       WHERE barberID = ?
       AND fecha = ?
       AND estado = "Reservado"
       AND (
         (? < horaFin) AND (? > horario)
       )
       LIMIT 1`,
      [barberID, fecha, horarioDB, horaFin]
    );

    if (solapado.length > 0) {
      return res.status(409).json({
        message: "Ese horario se superpone con otro turno"
      });
    }

    // 6️⃣ Insertar turno
    const [result] = await pool.query(
      `INSERT INTO turnos 
       (clienteID, barberID, servicioID, fecha, horario, horaFin, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [clienteID, barberID, servicioID, fecha, horarioDB, horaFin, "Reservado"]
    );

    res.status(201).json({
      message: "Turno creado correctamente",
      id: result.insertId
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al crear el turno"
    });
  }
};

/* ============================= */
/*        CANCELAR TURNO        */
/* ============================= */

export const cancelarTurno = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const role = req.user.role;

  try {
    const [rows] = await pool.query(
      `SELECT clienteID, barberID, estado 
       FROM turnos 
       WHERE id_turno = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Turno no encontrado" });
    }

    const turno = rows[0];

    if (turno.estado !== "Reservado") {
      return res.status(400).json({
        message: "El turno no puede ser cancelado"
      });
    }

    if (
      (role === "usuario" && turno.clienteID !== userId) ||
      (role === "barber" && turno.barberID !== userId)
    ) {
      return res.status(403).json({ message: "No autorizado" });
    }

    await pool.query(
      `UPDATE turnos 
       SET estado = "Cancelado" 
       WHERE id_turno = ?`,
      [id]
    );

    res.json({ message: "Turno cancelado correctamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al cancelar el turno"
    });
  }
};

/* ============================= */
/*        FINALIZAR TURNO       */
/* ============================= */

export const finalizarTurno = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const [rows] = await pool.query(
      `SELECT barberID, estado 
       FROM turnos 
       WHERE id_turno = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Turno no encontrado" });
    }

    const turno = rows[0];

    if (turno.barberID !== userId) {
      return res.status(403).json({ message: "No autorizado" });
    }

    if (turno.estado !== "Reservado") {
      return res.status(400).json({
        message: "El turno no puede ser finalizado"
      });
    }

    await pool.query(
      `UPDATE turnos 
       SET estado = "Finalizado" 
       WHERE id_turno = ?`,
      [id]
    );

    res.json({ message: "Turno finalizado correctamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al finalizar el turno"
    });
  }
};

/* ============================= */
/*     HORARIOS DISPONIBLES     */
/* ============================= */

export const horariosDisponibles = async (req, res) => {
  const { barberID, fecha } = req.query;

  if (!barberID || !fecha) {
    return res.status(400).json({
      message: "barberID y fecha son requeridos"
    });
  }

  try {

    const dias = [
      "domingo",
      "lunes",
      "martes",
      "miercoles",
      "jueves",
      "viernes",
      "sabado"
    ];

    const dia = dias[new Date(`${fecha}T00:00:00`).getDay()];

    // 1️⃣ Traer TODOS los bloques laborales
    const [horarios] = await pool.query(
      `SELECT horaInicio, horaFin
       FROM horariotrabajo
       WHERE barberID = ?
       AND dia = ?
       AND activo = true`,
      [barberID, dia]
    );

    if (horarios.length === 0) {
      return res.json([]);
    }

    // 2️⃣ Generar todos los bloques posibles
    let todos = [];

    for (const bloque of horarios) {
      const generados = generarHorarios(
        bloque.horaInicio.slice(0, 5),
        bloque.horaFin.slice(0, 5)
      );

      todos = [...todos, ...generados];
    }

    // 3️⃣ Traer turnos reservados
    const [turnos] = await pool.query(
      `SELECT horario, horaFin
       FROM turnos
       WHERE barberID = ?
       AND fecha = ?
       AND estado = "Reservado"`,
      [barberID, fecha]
    );

    // 4️⃣ Filtrar solapamientos reales
    const disponibles = todos.filter(bloque => {

      const bloqueInicio = new Date(`${fecha}T${bloque}:00`);
      const bloqueFin = new Date(bloqueInicio.getTime() + 30 * 60000);

      const seSuperpone = turnos.some(turno => {
        const turnoInicio = new Date(`${fecha}T${turno.horario}`);
        const turnoFin = new Date(`${fecha}T${turno.horaFin}`);

        return (
          bloqueInicio < turnoFin &&
          bloqueFin > turnoInicio
        );
      });

      return !seSuperpone;
    });

    res.json(disponibles);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener horarios disponibles"
    });
  }
};
