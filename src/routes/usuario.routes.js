import { Router } from "express";
import { createBarber, deleteUser, getBarberos, getUserById, getUsers, updateUser } from "../controllers/usuario.controller.js";
import verifyToken from "../middlewares/verifyToken.js"
import { verifyRole } from "../middlewares/verifyRole.js";

const router = Router();

// GET
router.get("/", verifyToken, verifyRole(["admin"]), getUsers)

router.get("/getBarbers", verifyToken, verifyRole(["usuario"]), getBarberos)

router.get("/:id",verifyToken, verifyRole(["admin"]), getUserById)

// POST
router.post("/",verifyToken, verifyRole(["admin"]), createBarber);

// PUT
router.put("/:id",verifyToken, verifyRole(["admin"]), updateUser)


// DELETE
router.delete("/:id",verifyToken, verifyRole(["admin"]), deleteUser)

export default router