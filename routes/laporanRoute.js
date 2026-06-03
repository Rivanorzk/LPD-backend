import express, { Router } from "express"
import { verifyToken, checkRole } from "../middleware/auth.js"
import {
  createReport,
  getAllReport,
  updateStatus,
  deleteReport,
  getReportById,
  getReportPublic,
  reportPdf,
} from "../controllers/laporanController.js"
import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import cloudinary from "../config/cloudinary.js"

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "laporan-masyarakat",
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
  
const router = express.Router()

router.post("/", verifyToken, upload.single("image"), createReport)
router.get("/", verifyToken, getAllReport)
router.get("/public/:id", getReportPublic)
router.get("/pdf/:id",verifyToken, reportPdf)
router.get("/:id", verifyToken, getReportById)


router.patch("/:id/status", verifyToken, checkRole("admin"), updateStatus)
router.delete("/:id", verifyToken, checkRole("admin"), deleteReport)

export default router