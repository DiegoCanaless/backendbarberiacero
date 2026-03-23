import { Router } from "express";
import verifyToken from "../middlewares/verifyToken.js"
import { verifyRole } from "../middlewares/verifyRole.js";
import { actualizarEstado, createService, getServices, getServicesActivos, guardarServiciosBarbero, misServicios } from "../controllers/service.controller.js";

const router = Router();


// GET

router.get("/", verifyToken, verifyRole(["admin", "barber"]), getServices )
router.get("/activos", verifyToken, verifyRole(["admin", "barber"]), getServicesActivos )
router.get("/mios", verifyToken, verifyRole(["admin", "barber"]), misServicios )



// POST

router.post("/", verifyToken, verifyRole(["admin"]), createService)
router.post("/agregarServicio", verifyToken, verifyRole(["barber"]), guardarServiciosBarbero)


// PUT
router.put("/actualizarEstado/:id", verifyToken, verifyRole(["admin"]), actualizarEstado)

export default router