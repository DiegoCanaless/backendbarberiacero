import app from "./app.js"
import bcrypt from "bcrypt"

const PORT = 3002;

app.listen(PORT, () => {
    
    console.log(`Servidor escuchando en http://localhost:${PORT}`)
})