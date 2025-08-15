import express from  "express";
import { gameUpload, gameView, bookingToggle, paymentToggle } from "../controllers/gameData.controller.js";
const router = express.Router();

router.post("/upload", gameUpload)
router.post("/view", gameView)
router.get("/bookingToggle", bookingToggle)
router.post("/paymentToggle", paymentToggle)


export default router;