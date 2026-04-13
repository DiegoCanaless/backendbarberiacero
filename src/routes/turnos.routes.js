import { Router } from "express";

import { cancelarTurno, crearTurno, finalizarTurno, getHistorialTurnos, getTurnosActivos, getTurnosByBarber, getTurnosByUser, horariosDisponibles } from "../controllers/turnos.controller.js";

import verifyToken from "../middlewares/verifyToken.js";
import { verifyRole } from "../middlewares/verifyRole.js";

const router = Router();

//GET
router.get("/activos", verifyToken, verifyRole(["admin"]), getTurnosActivos)
router.get("/barbero",verifyToken, verifyRole(["barber"]), getTurnosByBarber)
router.get("/usuario",verifyToken, verifyRole(["usuario"]), getTurnosByUser)
router.get("/horarios-disponibles", verifyToken, horariosDisponibles)
router.get("/historial", verifyToken, verifyRole(["admin"]), getHistorialTurnos)

// POST
router.post("/",verifyToken, verifyRole(["usuario"]), crearTurno)

// PUT
router.put("/cancelar/:id",verifyToken, verifyRole(["usuario", "barber"]), cancelarTurno)
router.put("/finalizar/:id",verifyToken, verifyRole(["barber", "admin"]), finalizarTurno)


export default router