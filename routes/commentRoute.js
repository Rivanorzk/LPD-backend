import express from "express"
import { verifyToken } from "../middleware/auth.js"

import {
  createComment,
  getCommentByReport,
  updateComment,
  deleteComment,
  replyComment,
} from "../controllers/commentController.js"

const router = express.Router()

router.post(
  "/",
  verifyToken,
  createComment
)

router.post(
  "/reply/:id",
  verifyToken,
  replyComment
)

router.put(
  "/:id",
  verifyToken,
  updateComment
)

router.delete(
  "/:id",
  verifyToken,
  deleteComment
)

router.get(
  "/report/:id",
  verifyToken,
  getCommentByReport
)

export default router