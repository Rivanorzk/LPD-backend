import express from "express"

import {
  getCategoryRequests,
  createCategoryRequest,
  approveCategoryRequest,
  rejectCategoryRequest,
} from "../controllers/categoryRequestController.js"

import {
  verifyToken,
} from "../middleware/auth.js"

const router =
  express.Router()

router.get(
  "/",
  verifyToken,
  getCategoryRequests
)

router.post(
  "/",
  verifyToken,
  createCategoryRequest
)

router.put(
  "/approve/:id",
  verifyToken,
  approveCategoryRequest
)

router.put(
  "/reject/:id",
  verifyToken,
  rejectCategoryRequest
)

export default router

