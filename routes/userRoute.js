import express from "express"
import verifySuperadmin, { verifyToken, checkRole } from "../middleware/auth.js"
import db from "../lib/database.js"
import multer from "multer"
import path from "path"
import bcrypt from "bcrypt"
import { createAdmin, getSuperadmins, updateUserRole } from "../controllers/userController.js"

const router = express.Router()

router.get("/", verifyToken, checkRole("superadmin"), async (req, res) => {
  const [data] = await db.query("SELECT * FROM users")
  res.json(data)
})

router.delete("/:id", verifyToken, checkRole("superadmin"), async (req, res) => {
  await db.query("DELETE FROM users WHERE id=?", [req.params.id])
  res.json({ message: "User dihapus" })
})

router.get(
  "/superadmins",
  verifyToken,
  getSuperadmins
)

router.put( "/role/:id", verifyToken, updateUserRole )


router.post(
  "/admins",
  verifyToken,
  verifySuperadmin,
  createAdmin
)


export default router