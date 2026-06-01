import express from "express"

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js"

import {
  verifyToken,
} from "../middleware/auth.js"

const router = express.Router()

router.get(
  "/",
  getCategories
)

router.post(
  "/",
  verifyToken,
  createCategory
)

router.put(
  "/:id",
  verifyToken,
  updateCategory
)

router.delete(
  "/:id",
  verifyToken,
  deleteCategory
)

export default router

