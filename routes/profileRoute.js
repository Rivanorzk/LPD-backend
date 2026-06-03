import express from "express"
import { verifyToken } from "../middleware/auth.js"

import {
  getProfile,
  updateProfile,
  updateProfileImage,
} from "../controllers/profileController.js"

import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import cloudinary from "../config/cloudinary.js"

const router = express.Router()

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profile-images",
    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "webp",
    ],
  },
})

const upload = multer({
  storage,
})

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