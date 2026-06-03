
import db from "../lib/database.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export async function register(req, res) {
  try {
    const { username, password } = req.body

    const [existingUser] = await db.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    )

    if (existingUser.length > 0) {
      return res.status(400).json({
        message: "Username telah digunakan"
      })
    }


    const hash = await bcrypt.hash(password, 10)


    await db.query(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [username, hash, "user"]
    )

    res.status(201).json({
      message: "Register berhasil"
    })
  } catch (err) {
    console.log(err)

    res.status(500).json({
      message: "Server error"
    })
  }
}

export async function login(req, res) {
  const { username, password } = req.body

  const [users] = await db.query(
    "SELECT * FROM users WHERE username=?",
    [username]
  )

  if (!users.length) {
    return res.json({ message: "User tidak ditemukan" })
  }

  const user = users[0]
  const match = await bcrypt.compare(password, user.password)

  if (!match) {
    return res.json({ message: "Password salah" })
  }

  const token = jwt.sign(
  {
    id: user.id,
    username: user.username,
    role: user.role,
  },
  "hypersecret",
  {
    expiresIn: "1d",
  }
)

  res.json({
    token,

    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
  })
}