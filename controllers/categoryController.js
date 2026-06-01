

import db from "../lib/database.js"
import { createAuditLog } from "./auditLogController.js"


export async function getCategories(
  req,
  res
) {

  try {

    const [rows] = await db.query(
      `
      SELECT *
      FROM categories
      ORDER BY id ASC
      `
    )

    res.json(rows)

  } catch (error) {

    console.log(
      "GET CATEGORY ERROR:",
      error
    )

    res.status(500).json({
      message: error.message,
    })
  }
}


export async function createCategory(
  req,
  res
) {

  try {

    console.log(
      "BODY:",
      req.body
    )

    console.log(
      "USER:",
      req.user
    )

    const {
      nama_kategori,
      icon,
    } = req.body


    if (!nama_kategori) {

      return res.status(400).json({
        message:
          "Nama kategori wajib diisi",
      })
    }


    const [result] = await db.query(
      `
      INSERT INTO categories
      (
        nama_kategori,
        icon
      )
      VALUES (?, ?)
      `,
      [
        nama_kategori,
        icon || null,
      ]
    )

    console.log(
      "INSERT RESULT:",
      result
    )


    if (req.user?.id) {

      await createAuditLog(
        req.user.id,
        "create_category",
        `Menambahkan kategori ${nama_kategori}`
      )

      console.log(
        "AUDIT LOG BERHASIL"
      )

    } else {

      console.log(
        "REQ.USER.ID TIDAK ADA"
      )
    }

    res.json({
      message:
        "Kategori berhasil ditambahkan",
    })

  } catch (error) {

    console.log(
      "CREATE CATEGORY ERROR:",
      error
    )

    res.status(500).json({
      message: error.message,
    })
  }
}


export async function updateCategory(
  req,
  res
) {

  try {

    const { id } = req.params

    const {
      nama_kategori,
      icon,
    } = req.body

    await db.query(
      `
      UPDATE categories
      SET
        nama_kategori = ?,
        icon = ?
      WHERE id = ?
      `,
      [
        nama_kategori,
        icon || null,
        id,
      ]
    )

    if (req.user?.id) {

      await createAuditLog(
        req.user.id,
        "update_category",
        `Mengupdate kategori ${nama_kategori}`
      )
    }

    res.json({
      message:
        "Kategori berhasil diupdate",
    })

  } catch (error) {

    console.log(
      "UPDATE CATEGORY ERROR:",
      error
    )

    res.status(500).json({
      message: error.message,
    })
  }
}


export async function deleteCategory(
  req,
  res
) {

  try {

    const { id } = req.params

    await db.query(
      `
      DELETE FROM categories
      WHERE id = ?
      `,
      [id]
    )

    if (req.user?.id) {

      await createAuditLog(
        req.user.id,
        "delete_category",
        `Menghapus kategori dengan ID ${id}`
      )
    }

    res.json({
      message:
        "Kategori berhasil dihapus",
    })

  } catch (error) {

    console.log(
      "DELETE CATEGORY ERROR:",
      error
    )

    res.status(500).json({
      message: error.message,
    })
  }
}
