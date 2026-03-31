USE barberia;

-- Usuarios
INSERT INTO usuario (name, apellido, email, telefono, password, role, estado)
VALUES
('Admin', 'Principal', 'admin@barberia.com', '1111111111', '$2b$10$56yAlwXJagwzggF7wkp4JenRr36AVpCA2SGRRevm7z0yqal2R6uvi', 'admin', 'activo'),

-- Servicios
INSERT INTO servicios (nombre, precio, duracion, estado)
VALUES
('Corte', 8000, 30, 'activo'),
('Afeitado', 5000, 30, 'activo'),
('Color', 15000, 60, 'activo');

INSERT INTO barbero_servicios (barberID, servicioID, estado)
VALUES
(2,1, 'activo'),
(2,2, 'activo'),
(3,1, 'activo'),
(3,3, 'activo');

-- Horarios Juan
INSERT INTO horariotrabajo (barberID, dia, horaInicio, horaFin)
VALUES
(2, 'lunes', '09:00', '13:00'),
(2, 'martes', '14:00', '18:00');

-- Horarios Pedro
INSERT INTO horariotrabajo (barberID, dia, horaInicio, horaFin)
VALUES
(3, 'lunes', '10:00', '16:00'),
(3, 'miercoles', '09:00', '12:00');

-- Turno de prueba
INSERT INTO turnos (clienteID, barberID, servicioID, fecha, horario)
VALUES
(4, 2, 1, '2026-02-10', '10:00', '10:30');
