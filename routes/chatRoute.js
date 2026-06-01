import express from "express"

import {
  sendMessage,
  getMessages,
  readMessages,
  getUnreadCount
} from "../controllers/chatController.js"

import {
  verifyToken,
} from "../middleware/auth.js"

const router =
  express.Router()

router.post(
  "/",
  verifyToken,
  sendMessage
)


router.get(
  "/unread",
  verifyToken,
  getUnreadCount
)

router.patch(
  "/read/:userId",
  verifyToken,
  readMessages
)

router.get(
  "/:userId",
  verifyToken,
  getMessages
)

export default router

