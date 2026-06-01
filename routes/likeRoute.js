import express from "express"
import { verifyToken } from "../middleware/auth.js"
import { toggleLike } from "../controllers/likeController.js"

const router = express.Router()

router.post("/", verifyToken, toggleLike)

export default router