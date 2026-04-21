import { query } from "../config/db.js"
import {
  mapTurnoConCliente,
  mapTurnoConBarbero,
  mapTurnoCompleto
} from "../utils/turno.mapper.js";
import { io } from "../server.js"

const toMinutes = (timeStr) => {
  const [h, m] = timeStr.slice(0, 5).split(":").map(Number);
  return h * 60 + m;
};

const fromMinutes = (totalMin) => {
  const h = Math.floor(totalMin / 60).toString().padStart(2, "0");
  const m = (totalMin % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};

/* ============================= */
/*      GET TURNOS BARBERO      */
/* ============================= */

export const getTurnosByBarber = async (req, res) => {
  const barberID = req.user.id;
  const { estado } = req.query;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  let filtroEstado = "";
  let usarPaginacion = false;

  if (estado === "activo") {
    filtroEstado = `AND t.estado NOT IN ('Cancelado', 'Finalizado')`;
  }

  if (estado === "historial") {
    filtroEstado = `AND t.estado IN ('Cancelado', 'Finalizado')`;
    usarPaginacion = true;
  }

  try {
    const queryBase = `
      SELECT 
        t.id_turno,
        t.fecha,
        t.horario,
        t.horaFin,
        t.estado,
        s.nombre AS servicio,
        u.id_usuario AS cliente_id,
        u.name AS cliente_name,
        u.apellido AS cliente_apellido
      FROM turnos t
      JOIN servicios s ON t.servicioID = s.id_servicio
      JOIN usuario u ON t.clienteID = u.id_usuario
      WHERE t.barberID = ?
      ${filtroEstado}
      ORDER BY t.fecha DESC, t.horario DESC
    `;

    if (usarPaginacion) {
      const [rows] = await query(
        `${queryBase} LIMIT ? OFFSET ?`,
        [barberID, limit, offset]
      );

      const [countRows] = await query(
        `SELECT COUNT(*) as total
         FROM turnos t
         WHERE t.barberID = ?
         ${filtroEstado}`,
        [barberID]
      );

      const total = countRows[0].total;
      const totalPages = Math.ceil(total / limit);

      return res.json({
        data: rows.map(mapTurnoConCliente),
        pagination: { total, page, limit, totalPages }
      });
    }

    const [rows] = await query(queryBase, [barberID]);
    res.json(rows.map(mapTurnoConCliente));

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
    const [rows] = await query(
      `SELECT 
        t.id_turno,
        t.fecha,
        t.horario,
        t.horaFin,
        t.estado,
        s.nombre AS servicio,
        b.id_usuario AS barber_id,
        b.name AS barber_name,
        b.apellido AS barber_apellido
      FROM turnos t
      JOIN servicios s ON t.servicioID = s.id_servicio
      JOIN usuario b ON t.barberID = b.id_usuario
      WHERE t.clienteID = ?
      ORDER BY t.fecha DESC, t.horario DESC`,
      [clienteID]
    );

    res.json(rows.map(mapTurnoConBarbero));

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

  if (isNaN(barberID) || isNaN(servicioID)) {
    return res.status(400).json({ message: "IDs inválidos" });
  }

  const horarioDB = horario.length === 5 ? `${horario}:00` : horario;

  try {
    // 🔹 Traer servicio
    const [servicio] = await query(
      `SELECT nombre, duracion FROM servicios 
       WHERE id_servicio = ? AND estado = 'activo'`,
      [servicioID]
    );

    if (servicio.length === 0) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    const duracion = servicio[0].duracion;

    // 🔹 Validar fecha
    const ahora = new Date();
    const fechaTurno = new Date(`${fecha}T${horarioDB}`);

    if (fechaTurno < ahora) {
      return res.status(400).json({ message: "No se puede reservar en el pasado" });
    }

    // 🔹 Validar barbero-servicio
    const [barberoServicio] = await query(
      `SELECT 1 FROM barbero_servicios
       WHERE barberID = ? AND servicioID = ? AND estado = 'activo'`,
      [barberID, servicioID]
    );

    if (barberoServicio.length === 0) {
      return res.status(400).json({ message: "Este barbero no realiza ese servicio" });
    }

    // 🔹 Calcular horaFin
    const inicioMin = toMinutes(horarioDB);
    const finMin = inicioMin + duracion;
    const horaFin = `${fromMinutes(finMin)}:00`;

    // 🔹 Día
    const dias = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
    const dia = dias[new Date(`${fecha}T00:00:00`).getDay()];

    // 🔹 Horarios laborales
    const [horarios] = await query(
      `SELECT horaInicio, horaFin FROM horariotrabajo
       WHERE barberID = ? AND dia = ? AND estado = 'activo'`,
      [barberID, dia]
    );

    if (horarios.length === 0) {
      return res.status(400).json({ message: "El barbero no trabaja ese día" });
    }

    const dentroDeHorario = horarios.some(h => {
      const inicioTurnoMin = toMinutes(horarioDB);
      const finTurnoMin = toMinutes(horaFin);
      const inicioLaburoMin = toMinutes(h.horaInicio);
      const finLaburoMin = toMinutes(h.horaFin);

      return inicioTurnoMin >= inicioLaburoMin && finTurnoMin <= finLaburoMin;
    });

    if (!dentroDeHorario) {
      return res.status(400).json({ message: "Fuera del horario laboral" });
    }

    // 🔹 Validar solapamiento
    const [solapado] = await query(
      `SELECT 1 FROM turnos
       WHERE barberID = ?
       AND fecha = ?
       AND estado = 'Reservado'
       AND (? < horaFin AND ? > horario)
       LIMIT 1`,
      [barberID, fecha, horarioDB, horaFin]
    );

    if (solapado.length > 0) {
      return res.status(409).json({ message: "Horario ocupado" });
    }

    // 🔹 INSERT
    const [result] = await query(
      `INSERT INTO turnos 
       (clienteID, barberID, servicioID, fecha, horario, horaFin, estado)
       VALUES (?, ?, ?, ?, ?, ?, 'Reservado')`,
      [clienteID, barberID, servicioID, fecha, horarioDB, horaFin]
    );

    // 🔥 Traer barbero (SIN JOIN)
    const [barbero] = await query(
      `SELECT id_usuario, name, apellido FROM usuario WHERE id_usuario = ?`,
      [barberID]
    );

    // 🔥 Objeto FINAL (igual al frontend)
    const nuevoTurno = {
      id_turno: result.lastInsertRowid,
      fecha,
      horario: horarioDB,
      horaFin,
      estado: "Reservado",

      servicio: servicio[0].nombre,

      barbero: {
        id_usuario: barbero[0]?.id_usuario,
        name: barbero[0]?.name,
        apellido: barbero[0]?.apellido
      },

      clienteID
    };




    // 🔥 SOCKET (nombre correcto)
    io.emit("nuevo_turno", nuevoTurno);

    return res.status(201).json({
      message: "Turno creado correctamente",
      turno: nuevoTurno
    });

  } catch (error) {
    console.error("ERROR CREAR TURNO:", error);
    return res.status(500).json({ message: "Error al crear el turno" });
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
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const [rows] = await query(
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
      return res.status(400).json({ message: "El turno no puede ser cancelado" });
    }

    if (
      (role === "usuario" && turno.clienteID !== userId) ||
      (role === "barber" && turno.barberID !== userId)
    ) {
      return res.status(403).json({ message: "No autorizado" });
    }

    await query(
      `UPDATE turnos SET estado = 'Cancelado' WHERE id_turno = ?`,
      [id]
    );

    io.emit("turno_cancelado", {
      id_turno: Number(id),
      barbero: { id_usuario: turno.barberID } 
    })

    res.json({ message: "Turno cancelado correctamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al cancelar el turno" });
  }
};


/* ============================= */
/*        FINALIZAR TURNO       */
/* ============================= */

export const finalizarTurno = async (req, res) => {
  const { id } = req.params;

  try {
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const [rows] = await query(
      `SELECT barberID, estado FROM turnos WHERE id_turno = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Turno no encontrado" });
    }

    const turno = rows[0];

    if (turno.estado !== "Reservado") {
      return res.status(400).json({ message: "El turno no puede ser finalizado" });
    }

    await query(
      `UPDATE turnos SET estado = 'Finalizado' WHERE id_turno = ?`,
      [id]
    );

    io.emit("turno_finalizado", { id_turno: Number(id) })

    res.json({ message: "Turno finalizado correctamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al finalizar el turno" });
  }
};


/* ============================= */
/*     HORARIOS DISPONIBLES     */
/* ============================= */

export const horariosDisponibles = async (req, res) => {
  const { barberID, fecha, servicioID } = req.query;

  if (!barberID || !fecha || !servicioID) {
    return res.status(400).json({
      message: "barberID, fecha y servicioID son requeridos"
    });
  }

  try {
    const [servicio] = await query(
      `SELECT duracion FROM servicios WHERE id_servicio = ? AND estado = 'activo'`,
      [servicioID]
    );

    if (servicio.length === 0) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    const duracion = servicio[0].duracion;

    const dias = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
    const dia = dias[new Date(`${fecha}T00:00:00`).getDay()];

    const [horarios] = await query(
      `SELECT horaInicio, horaFin
       FROM horariotrabajo
       WHERE barberID = ? AND dia = ? AND estado = 'activo'`,
      [barberID, dia]
    );

    if (horarios.length === 0) return res.json([]);

    // 🔹 Generar todos los slots posibles
    const todos = horarios.flatMap(bloque => {
      const inicioMin = toMinutes(bloque.horaInicio);
      const finMin = toMinutes(bloque.horaFin);

      const slots = [];
      for (let t = inicioMin; t + duracion <= finMin; t += 30) {
        slots.push(fromMinutes(t));
      }

      return slots;
    });

    // 🔥 FILTRO: eliminar horarios pasados si es hoy
    const ahora = new Date();

    // ✅ FECHA LOCAL (NO UTC)
    const hoyStr = [
      ahora.getFullYear(),
      String(ahora.getMonth() + 1).padStart(2, "0"),
      String(ahora.getDate()).padStart(2, "0")
    ].join("-");

    let todosFiltrados = todos;

    if (fecha === hoyStr) {
      const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();

      todosFiltrados = todos.filter(slot => {
        const slotMin = toMinutes(slot);

        return slotMin > (minutosAhora + 5);

      });
    }


    // 🔹 Turnos ya reservados
    const [turnos] = await query(
      `SELECT horario, horaFin
       FROM turnos
       WHERE barberID = ? AND fecha = ? AND estado = 'Reservado'`,
      [barberID, fecha]
    );

    // 🔹 Filtrar solapamientos
    const disponibles = todosFiltrados.filter(slot => {
      const slotInicioMin = toMinutes(slot);
      const slotFinMin = slotInicioMin + duracion;

      return !turnos.some(t => {
        const tInicioMin = toMinutes(t.horario);
        const tFinMin = toMinutes(t.horaFin);
        return slotInicioMin < tFinMin && slotFinMin > tInicioMin;
      });
    });

    res.json(disponibles);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener horarios disponibles" });
  }
};



/* ============================= */
/*       TURNOS ACTIVOS         */
/* ============================= */

export const getTurnosActivos = async (req, res) => {
  try {
    const [turnos] = await query(`
      SELECT 
        t.id_turno,
        t.fecha,
        t.horario,
        t.estado,
        s.nombre AS servicio,
        u.id_usuario AS cliente_id,
        u.name AS cliente_name,
        u.apellido AS cliente_apellido,
        b.id_usuario AS barber_id,
        b.name AS barber_name,
        b.apellido AS barber_apellido
      FROM turnos t
      JOIN servicios s ON t.servicioID = s.id_servicio
      JOIN usuario u ON t.clienteID = u.id_usuario
      JOIN usuario b ON t.barberID = b.id_usuario
      WHERE t.estado NOT IN ('Cancelado', 'Finalizado')
      ORDER BY t.fecha DESC, t.horario DESC
    `);

    res.json(turnos.map(mapTurnoCompleto));

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al traer turnos" });
  }
};


/* ============================= */
/*       HISTORIAL TURNOS       */
/* ============================= */

export const getHistorialTurnos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;

    const [turnos] = await query(`
      SELECT 
        t.id_turno,
        t.fecha,
        t.horario,
        t.estado,
        s.nombre AS servicio,
        u.id_usuario AS cliente_id,
        u.name AS cliente_name,
        u.apellido AS cliente_apellido,
        b.id_usuario AS barber_id,
        b.name AS barber_name,
        b.apellido AS barber_apellido
      FROM turnos t
      JOIN servicios s ON t.servicioID = s.id_servicio
      JOIN usuario u ON t.clienteID = u.id_usuario
      JOIN usuario b ON t.barberID = b.id_usuario
      WHERE t.estado IN ('Finalizado', 'Cancelado')
      ORDER BY t.fecha DESC, t.horario DESC
      LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [[count]] = await query(
      `SELECT COUNT(*) as total
       FROM turnos
       WHERE estado IN ('Finalizado', 'Cancelado')`
    );

    const total = count.total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      data: turnos.map(mapTurnoCompleto),
      pagination: { total, page, limit, totalPages }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al traer el historial de turnos" });
  }
};