import { Router } from "express";

import { cancelarTurno, crearTurno, finalizarTurno, getTurnosByBarber, getTurnosByUser, horariosDisponibles } from "../controllers/turnos.controller.js";

import verifyToken from "../middlewares/verifyToken.js";
import { verifyRole } from "../middlewares/verifyRole.js";

const router = Router();

//GET
// router.get("/allTurnos", verifyToken, verifyRole(["admin"], getAllTurnos))
router.get("/barbero/:id",verifyToken, verifyRole(["barber"]), getTurnosByBarber)
router.get("/usuario",verifyToken, verifyRole(["usuario"]), getTurnosByUser)
router.get("/horarios-disponibles", verifyToken, horariosDisponibles)

// POST
router.post("/",verifyToken, verifyRole(["usuario"]), crearTurno)

// PUT
router.put("/cancelar/:id",verifyToken, verifyRole(["usuario", "barber"]), cancelarTurno)
router.put("/finalizar/:id",verifyToken, verifyRole(["barber"]), finalizarTurno)


export default router