

import express from "express"

import {
  verifyToken,
} from "../middleware/auth.js"

import { getAuditLogs } from "../controllers/auditLogController.js"

const router =
  express.Router()

router.get(
  "/",
  verifyToken,
  getAuditLogs
)

export default router