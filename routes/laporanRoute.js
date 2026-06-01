import express from "express"
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

const router = express.Router()
import path from "path"

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },

  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() +
        path.extname(file.originalname)
    )
  },
})

const upload = multer({ storage })

router.post("/", verifyToken, upload.single("image"), createReport)
router.get("/", verifyToken, getAllReport)
router.get("/public/:id", getReportPublic)
router.get("/pdf/:id",verifyToken, reportPdf)
router.get("/:id", verifyToken, getReportById)


router.patch("/:id/status", verifyToken, checkRole("admin"), updateStatus)
router.delete("/:id", verifyToken, checkRole("admin"), deleteReport)

export default router