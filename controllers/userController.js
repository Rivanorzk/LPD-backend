
import bcrypt from "bcrypt"
import db from "../lib/database.js"

import {
  createAuditLog,
} from "./auditLogController.js"


export async function getUsers(
  req,
  res
) {
  try {

    const [data] =
      await db.query(
        "SELECT * FROM users"
      )

    res.json(data)

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message:
        error.message,
    })
  }
}


export async function getSuperadmins(
  req,
  res
) {

  try {

    const [rows] =
      await db.query(
        `
        SELECT
          u.id,
          u.username,
          u.role,

          COUNT(c.id)
          AS unread_count

        FROM users u

        LEFT JOIN chats c
        ON
          c.sender_id = u.id

          AND

          c.receiver_id = ?

          AND

          c.is_read = FALSE

        WHERE
          u.role = 'superadmin'

        GROUP BY
          u.id

        ORDER BY
          u.username ASC
        `,
        [req.user.id]
      )

    res.json(rows)

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message:
        error.message,
    })
  }
}

export async function updateUserRole(
  req,
  res
) {
  try {

    const { id } =
      req.params

    const { role } =
      req.body


    const allowedRoles = [
      "user",
      "admin",
      "superadmin",
    ]

    if (
      !allowedRoles.includes(
        role
      )
    ) {
      return res.status(400).json({
        message:
          "Role tidak valid",
      })
    }


    const [users] =
      await db.query(
        `
        SELECT *
        FROM users
        WHERE id = ?
        `,
        [id]
      )

    if (
      users.length === 0
    ) {
      return res.status(404).json({
        message:
          "User tidak ditemukan",
      })
    }

    const selectedUser =
      users[0]


    await db.query(
      `
      UPDATE users
      SET role = ?
      WHERE id = ?
      `,
      [role, id]
    )


    await createAuditLog(
      req.user.id,
      "update_role",
      `Mengubah role ${selectedUser.username} menjadi ${role}`
    )

    res.json({
      message:
        "Role berhasil diupdate",
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message:
        error.message,
    })
  }
}


export async function deleteUser(
  req,
  res
) {
  try {

    const { id } =
      req.params


    const [users] =
      await db.query(
        `
        SELECT *
        FROM users
        WHERE id = ?
        `,
        [id]
      )

    if (
      users.length === 0
    ) {
      return res.status(404).json({
        message:
          "User tidak ditemukan",
      })
    }

    const selectedUser =
      users[0]


    await db.query(
      `
      DELETE FROM users
      WHERE id = ?
      `,
      [id]
    )


    await createAuditLog(
      req.user.id,
      "delete_user",
      `Menghapus user ${selectedUser.username}`
    )

    res.json({
      message:
        "User berhasil dihapus",
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message:
        error.message,
    })
  }
}


export async function createAdmin(
  req,
  res
) {
  try {

    const {
      username,
      password,
    } = req.body


    if (
      !username ||
      !password
    ) {
      return res.status(400).json({
        message:
          "Username dan password wajib diisi",
      })
    }


    const [existingUser] =
      await db.query(
        `
        SELECT id
        FROM users
        WHERE username = ?
        `,
        [username]
      )

    if (
      existingUser.length > 0
    ) {
      return res.status(400).json({
        message:
          "Username sudah digunakan",
      })
    }


    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      )


    await db.query(
      `
      INSERT INTO users
      (
        username,
        password,
        role
      )
      VALUES (?, ?, ?)
      `,
      [
        username,
        hashedPassword,
        "admin",
      ]
    )


    await createAuditLog(
      req.user.id,
      "create_admin",
      `Menambahkan admin ${username}`
    )

    res.status(201).json({
      message:
        "Admin berhasil dibuat",
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message:
        error.message,
    })
  }
}

