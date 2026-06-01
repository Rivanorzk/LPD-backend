import express from "express"
import { verifyToken } from "../middleware/auth.js"

import {
  getProfile,
  updateProfile,
  updateProfileImage,
} from "../controllers/profileController.js"

import multer from "multer"
import path from "path"

const router = express.Router()

const storage =
  multer.diskStorage({
    destination: (
      req,
      file,
      cb
    ) => {
      cb(null, "uploads/")
    },

    filename: (
      req,
      file,
      cb
    ) => {
      cb(
        null,
        Date.now() +
          path.extname(
            file.originalname
          )
      )
    },
  })

const upload =
  multer({ storage })

router.get(
  "/",
  verifyToken,
  getProfile
)

router.put(
  "/",
  verifyToken,
  updateProfile
)

router.put(
  "/image",
  verifyToken,
  upload.single("image"),
  updateProfileImage
)

export default router