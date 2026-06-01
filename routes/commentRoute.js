

import express from "express"
import { verifyToken } from "../middleware/auth.js"

import {
  createComment,
  getCommentByReport,
} from "../controllers/commentController.js"

const router = express.Router()

router.post(
  "/",
  verifyToken,
  createComment
)

router.get(
  "/:id",
  verifyToken,
  getCommentByReport
)

export default router