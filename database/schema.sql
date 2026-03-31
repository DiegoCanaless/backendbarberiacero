CREATE DATABASE IF NOT EXISTS barberia;

USE barberia;

CREATE TABLE usuario(
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telefono VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM("admin", "usuario", "barber") NOT NULL,
    estado ENUM("activo", "oculto") DEFAULT "activo",
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE servicios (
    id_servicio INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    duracion INT NOT NULL,
    estado ENUM("activo", "oculto") DEFAULT "activo",
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE barbero_servicios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    barberID INT NOT NULL,
    servicioID INT NOT NULL,
    estado ENUM("activo", "oculto") DEFAULT "activo",
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (barberID) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (servicioID) REFERENCES servicios(id_servicio) ON DELETE CASCADE,

    UNIQUE (barberID, servicioID)
);


CREATE TABLE IF NOT EXISTS turnos (
    id_turno INTEGER PRIMARY KEY AUTOINCREMENT,
    clienteID INTEGER NOT NULL,
    barberID INTEGER NOT NULL,
    servicioID INTEGER NOT NULL,
    fecha TEXT NOT NULL,
    horario TEXT NOT NULL,
    horaFin TEXT NOT NULL,
    estado TEXT DEFAULT 'reservado',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (clienteID) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (barberID) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (servicioID) REFERENCES servicios(id_servicio) ON DELETE CASCADE
);


CREATE TABLE horariotrabajo(
    id_horario INT PRIMARY KEY AUTO_INCREMENT ,
    barberID INT NOT NULL,
    dia ENUM('lunes','martes','miercoles','jueves','viernes','sabado','domingo') NOT NULL,
    horaInicio TIME NOT NULL ,
    horaFin TIME NOT NULL,
    estado ENUM("activo", "oculto") DEFAULT "activo",
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (barberID) REFERENCES usuario(id_usuario) ON DELETE CASCADE,

    UNIQUE (barberID, dia, horaInicio, horaFin)

    

);



