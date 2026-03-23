CREATE DATABASE IF NOT EXISTS barberia;

USE barberia;

CREATE TABLE usuario(
    id_cliente INT PRIMARY KEY AUTO_INCREMENT,
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
    
    FOREIGN KEY (barberID) REFERENCES usuario(id_cliente),
    FOREIGN KEY (servicioID) REFERENCES servicios(id_servicio),

    UNIQUE (barberID, servicioID)
);


CREATE TABLE turnos(
    id_turno INT PRIMARY KEY AUTO_INCREMENT ,
    clienteID INT NOT NULL,
    barberID INT NOT NULL,
    servicioID INT NOT NULL,
    fecha DATE NOT NULL,
    horario TIME NOT NULL,
    estado ENUM("Reservado", "Cancelado","Finalizado") DEFAULT "Reservado",
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,

    FOREIGN KEY (clienteID) REFERENCES usuario(id_cliente),
    FOREIGN KEY (barberID) REFERENCES usuario(id_cliente),
    FOREIGN KEY (servicioID) REFERENCES servicios(id_servicio)

);

CREATE TABLE horariotrabajo(
    id_horario INT PRIMARY KEY AUTO_INCREMENT ,
    barberID INT NOT NULL,
    dia ENUM('lunes','martes','miercoles','jueves','viernes','sabado','domingo') NOT NULL,
    horaInicio TIME NOT NULL ,
    horaFin TIME NOT NULL,
    estado ENUM("activo", "oculto") DEFAULT "activo",
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (barberID) REFERENCES usuario(id_cliente),

    UNIQUE (barberID, dia, horaInicio, horaFin)

    

);



