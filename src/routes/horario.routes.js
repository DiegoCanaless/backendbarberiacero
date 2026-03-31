import { Router } from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { verifyRole } from "../middlewares/verifyRole.js";
import { crearHorario, obtenerMisHorario, toggleHorario } from "../controllers/horario.controller.js";

const router = Router();

router.post("/", verifyToken, verifyRole(["barber"]), crearHorario);

router.get("/mios", verifyToken, verifyRole(["barber"]), obtenerMisHorario)

router.put("/:id/desactivar", verifyToken, verifyRole(["barber"]), toggleHorario)


export default router