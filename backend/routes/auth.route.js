import express from  "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { register, login, logout, checkAuth } from "../controllers/auth.controller.js";
const router = express.Router();

router.post("/register", register)
router.post("/login", login)
router.post("/logout", logout)
router.get("/checkAuth", verifyToken, checkAuth)


export default router;