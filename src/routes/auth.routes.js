import { Router } from "express";
import { changeStatus, login, logout, me, register } from "../controllers/auth.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
import { verifyRole } from "../middlewares/verifyRole.js";



const router= Router();

router.post("/login", login)
router.post("/register", register)
router.post("/logout", logout)

router.get("/me", verifyToken, me)

router.put("/:id", verifyToken, verifyRole(["admin"]), changeStatus )

export default router