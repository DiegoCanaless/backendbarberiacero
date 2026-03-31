import dotenv from "dotenv"
import express from "express"
import cors from "cors";
import cookieParser from "cookie-parser";

import barberRoutes from "./routes/barber.routes.js"
import usuarioRoutes from "./routes/usuario.routes.js"
import turnosRoutes from "./routes/turnos.routes.js"
import authRoutes from "./routes/auth.routes.js"
import horariosRoutes from "./routes/horario.routes.js"
import serviceRoutes from "./routes/servicios.routes.js"

dotenv.config()
const app = express()

app.use(cors({
    origin: [process.env.CLIENT_URL || "http://localhost:3000"],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser())

app.get("/", (req, res) => {
    res.send("Servidor Funcionando")
});

app.use("/barberos", barberRoutes)

app.use("/usuarios", usuarioRoutes)

app.use("/turnos", turnosRoutes)

app.use("/auth", authRoutes)

app.use("/servicios", serviceRoutes)

app.use("/horarios", horariosRoutes)

export default app;