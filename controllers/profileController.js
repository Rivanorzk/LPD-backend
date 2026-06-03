import db from "../lib/database.js"
import bcrypt from "bcrypt"

export async function getProfile(
  req,
  res
) {
  try {

    const [rows] =
      await db.query(
        `
        SELECT
          id,
          username,
          role,
          image
        FROM users
        WHERE id = ?
        `,
        [req.user.id]
      )

    res.json(rows[0])

  } catch (error) {

    res.status(500).json({
      message:
        error.message,
    })
  }
}

export async function updateProfile(
  req,
  res
) {
  try {

    const {
      username,
      oldPassword,
      newPassword,
    } = req.body

    const [users] =
      await db.query(
        "SELECT * FROM users WHERE id=?",
        [req.user.id]
      )

    const user = users[0]

    if (!user) {
      return res.status(404).json({
        message:
          "User tidak ditemukan",
      })
    }

    let password =
      user.password

    if (newPassword) {

      const match =
        await bcrypt.compare(
          oldPassword,
          user.password
        )

      if (!match) {
        return res.status(400).json({
          message:
            "Password lama salah",
        })
      }

      password =
        await bcrypt.hash(
          newPassword,
          10
        )
    }

    await db.query(
      `
      UPDATE users
      SET username=?,
          password=?
      WHERE id=?
      `,
      [
        username,
        password,
        req.user.id,
      ]
    )

    res.json({
      message:
        "Profil berhasil diperbarui",
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message:
        error.message,
    })
  }
}

export async function updateProfileImage(
  req,
  res
) {
  try {

    await db.query(
      `
      UPDATE users
      SET image = ?
      WHERE id = ?
      `,
      [
        req.file.path,
        req.user.id,
      ]
    )

    res.json({
      image:
        req.file.path,
      message:
        "Foto profil berhasil diperbarui",
    })

  } catch (error) {

    res.status(500).json({
      message:
        error.message,
    })
  }
}