import db from "../src/config/db.js";

export const initDB = () => {
    db.serialize(() => {

        db.run("PRAGMA foreign_keys = ON");

        // 🧑‍💻 USUARIO
        db.run(`
            CREATE TABLE IF NOT EXISTS usuario (
                id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                apellido TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                telefono TEXT NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL,
                estado TEXT DEFAULT 'activo',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // ✂️ SERVICIOS
        db.run(`
            CREATE TABLE IF NOT EXISTS servicios (
                id_servicio INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                precio REAL NOT NULL,
                duracion INTEGER NOT NULL,
                estado TEXT DEFAULT 'activo',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 🔗 BARBERO_SERVICIOS
        db.run(`
            CREATE TABLE IF NOT EXISTS barbero_servicios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                barberID INTEGER NOT NULL,
                servicioID INTEGER NOT NULL,
                estado TEXT DEFAULT 'activo',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (barberID) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
                FOREIGN KEY (servicioID) REFERENCES servicios(id_servicio) ON DELETE CASCADE,

                UNIQUE (barberID, servicioID)
            )
        `);

        // 📅 TURNOS
        db.run(`
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
                FOREIGN KEY (servicioID) REFERENCES servicios(id_servicio) ON DELETE CASCADE,

                UNIQUE (barberID, fecha, horario)
            )
        `);

        // 🕒 HORARIO TRABAJO
        db.run(`
            CREATE TABLE IF NOT EXISTS horariotrabajo (
                id_horario INTEGER PRIMARY KEY AUTOINCREMENT,
                barberID INTEGER NOT NULL,
                dia TEXT NOT NULL,
                horaInicio TEXT NOT NULL,
                horaFin TEXT NOT NULL,
                estado TEXT DEFAULT 'activo',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (barberID) REFERENCES usuario(id_usuario) ON DELETE CASCADE,

                UNIQUE (barberID, dia)
            )
        `);

        console.log("Tablas creadas correctamente");


        // 🌱 SEED USUARIOS
        db.get("SELECT COUNT(*) as count FROM usuario", (err, row) => {
            if (row.count === 0) {
                console.log("🌱 Insertando usuarios...");

                db.run(`
                    INSERT INTO usuario (name, apellido, email, telefono, password, role)
                    VALUES 
                    ('Admin', 'Principal', 'admin@barberia.com', '1111111111', '$2b$10$56yAlwXJagwzggF7wkp4JenRr36AVpCA2SGRRevm7z0yqal2R6uvi', 'admin'),
                    ('Juan', 'Corte', 'juan@barberia.com', '2222222222', '123456', 'barber'),
                    ('Pedro', 'Fade', 'pedro@barberia.com', '3333333333', '123456', 'barber'),
                    ('Carlos', 'Cliente', 'carlos@mail.com', '4444444444', '123456', 'usuario')
                `);
            }
        });

        // 🌱 SERVICIOS
        db.get("SELECT COUNT(*) as count FROM servicios", (err, row) => {
            if (row.count === 0) {
                console.log("🌱 Insertando servicios...");

                db.run(`
                    INSERT INTO servicios (nombre, precio, duracion)
                    VALUES 
                    ('Corte', 8000, 30),
                    ('Afeitado', 5000, 30),
                    ('Color', 15000, 60)
                `);
            }
        });

        // 🌱 BARBERO_SERVICIOS
        db.get("SELECT COUNT(*) as count FROM barbero_servicios", (err, row) => {
            if (row.count === 0) {
                console.log("🌱 Insertando barbero-servicios...");

                db.run(`
                    INSERT INTO barbero_servicios (barberID, servicioID)
                    VALUES 
                    (2,1),
                    (2,2),
                    (3,1),
                    (3,3)
                `);
            }
        });

        // 🌱 HORARIOS
        db.get("SELECT COUNT(*) as count FROM horariotrabajo", (err, row) => {
            if (row.count === 0) {
                console.log("🌱 Insertando horarios...");

                db.run(`
                    INSERT INTO horariotrabajo (barberID, dia, horaInicio, horaFin)
                    VALUES 
                    (2, 'lunes', '09:00', '13:00'),
                    (2, 'martes', '14:00', '18:00'),
                    (3, 'lunes', '10:00', '16:00'),
                    (3, 'miercoles', '09:00', '12:00')
                `);
            }
        });


    });
};
