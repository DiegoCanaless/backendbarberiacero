
import { initDB } from "../database/initDB.js";
import app from "./app.js"
import { Server } from "socket.io";
import { setupSockets } from "./sockets/index.js";
import { createServer } from "http";

const PORT = process.env.PORT || 3002;

initDB();

const httpServer = createServer(app)

const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
})

setupSockets(io)

export { io }


httpServer.listen(PORT, () => {
    console.log(`Servidor escuchando en ${PORT}`)
})
