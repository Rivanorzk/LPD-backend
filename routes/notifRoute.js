import express from "express"

import {
  getNotifications,
  readNotifications,
} from "../controllers/notifController.js"

import {
  verifyToken,
} from "../middleware/auth.js"

const router = express.Router()

router.get(
  "/",
  verifyToken,
  getNotifications
)

router.patch(
  "/read",
  verifyToken,
  readNotifications
)

export default router

