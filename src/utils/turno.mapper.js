export const mapCliente = (row) => ({
    id_cliente: row.cliente_id,
    name: row.cliente_name,
    apellido: row.cliente_apellido
});

export const mapBarbero = (row) => ({
    id_barbero: row.barber_id,
    name: row.barber_name,
    apellido: row.barber_apellido
});

export const mapTurnoConCliente = (row) => ({
    id_turno: row.id_turno,
    fecha: row.fecha,
    horario: row.horario,
    horaFin: row.horaFin,
    estado: row.estado,
    servicio: row.servicio,
    cliente: mapCliente(row)
});

export const mapTurnoConBarbero = (row) => ({
    id_turno: row.id_turno,
    fecha: row.fecha,
    horario: row.horario,
    horaFin: row.horaFin,
    estado: row.estado,
    servicio: row.servicio,
    barbero: mapBarbero(row)
});

export const mapTurnoCompleto = (row) => ({
    id_turno: row.id_turno,
    fecha: row.fecha,
    horario: row.horario,
    horaFin: row.horaFin,
    estado: row.estado,
    servicio: row.servicio,
    cliente: mapCliente(row),
    barbero: mapBarbero(row)
});
