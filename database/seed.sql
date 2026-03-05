USE barberia;

-- Usuarios
INSERT INTO usuario (name, apellido, email, telefono, password, role)
VALUES
('Admin', 'Principal', 'admin@barberia.com', '1111111111', '$2b$10$56yAlwXJagwzggF7wkp4JenRr36AVpCA2SGRRevm7z0yqal2R6uvi', 'admin'),
('Juan', 'Corte', 'juan@barberia.com', '2222222222', 'hash_barber1', 'barber'),
('Pedro', 'Fade', 'pedro@barberia.com', '3333333333', 'hash_barber2', 'barber'),
('Carlos', 'Cliente', 'carlos@mail.com', '4444444444', 'hash_cliente', 'usuario'),
('Lucia', 'Cliente', 'lucia@mail.com', '5555555555', 'hash_cliente', 'usuario');

-- Servicios
INSERT INTO servicios (nombre, precio, duracion)
VALUES
('Corte', 8000, 30),
('Afeitado', 5000, 30),
('Color', 15000, 60);

INSERT INTO barbero_servicios (barberID, servicioID)
VALUES
(2,1),
(2,2),
(3,1),
(3,3);



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
(4, 2, 1, '2026-02-10', '10:00');
