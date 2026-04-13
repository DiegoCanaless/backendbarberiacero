import dotenv from "dotenv";
import express from "express";
import cors from "cors";

import barberRoutes from "./routes/barber.routes.js";
import usuarioRoutes from "./routes/usuario.routes.js";
import turnosRoutes from "./routes/turnos.routes.js";
import authRoutes from "./routes/auth.routes.js";
import horariosRoutes from "./routes/horario.routes.js";
import serviceRoutes from "./routes/servicios.routes.js";

dotenv.config();
const app = express();

const allowedOrigins = [
    process.env.CLIENT_URL || "http://localhost:3000"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`CORS bloqueado para: ${origin}`);
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// Ruta test
app.get("/", (req, res) => {
    res.send("Servidor Funcionando");
});

// Rutas
app.use("/barberos", barberRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/turnos", turnosRoutes);
app.use("/auth", authRoutes);
app.use("/servicios", serviceRoutes);
app.use("/horarios", horariosRoutes);

export default app;
