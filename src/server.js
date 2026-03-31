import { initDB } from "../database/initDB.js";
import app from "./app.js"
import bcrypt from "bcrypt"

const PORT = process.env.PORT || 3002;

initDB();

app.listen(PORT, () => {
    
    console.log(`Servidor escuchando en ${PORT} `)
})