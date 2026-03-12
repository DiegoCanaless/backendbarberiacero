import { Router } from "express";
import { getBarbers, getHorarioBarbero, getServiciosByBarber } from "../controllers/barber.controller.js";
import { verifyRole } from "../middlewares/verifyRole.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = Router();

router.get("/",verifyToken, verifyRole(["usuario", "admin"]), getBarbers);

router.get("/:id/horarios", getHorarioBarbero);

router.get("/:id/servicios", getServiciosByBarber)

export default router;