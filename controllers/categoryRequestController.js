import db from "../lib/database.js"
import { createAuditLog } from "./auditLogController.js"


export async function getCategoryRequests(
  req,
  res
) {
  try {

    const [rows] = await db.query(
      `
      SELECT
        cr.*,
        u.username
      FROM category_requests cr
      JOIN users u
      ON cr.admin_id = u.id
      ORDER BY cr.id DESC
      `
    )
    
    res.json(rows)

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: error.message,
    })
  }
}


export async function createCategoryRequest(
  req,
  res
) {
  try {

    const {
      nama_kategori,
      action_type,
      category_id,
    } = req.body

    const admin_id =
      req.user.id

    await db.query(
      `
      INSERT INTO category_requests
      (
        admin_id,
        category_id,
        nama_kategori,
        action_type
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        admin_id,
        category_id || null,
        nama_kategori,
        action_type,
      ]
    )

    await createAuditLog(
      req.user.id,
      "create_category_request",
      `Membuat request ${action_type} kategori ${nama_kategori}`
    )

    res.json({
      message:
        "Request kategori berhasil dikirim",
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: error.message,
    })
  }
}


export async function approveCategoryRequest(
  req,
  res
) {
  try {

    const { id } = req.params

    const { icon } = req.body

    const [rows] = await db.query(
      `
      SELECT *
      FROM category_requests
      WHERE id = ?
      `,
      [id]
    )

    if (rows.length === 0) {
      return res.status(404).json({
        message:
          "Request tidak ditemukan",
      })
    }

    const request =
      rows[0]


    if (
      request.action_type ===
      "create"
    ) {

      await db.query(
        `
        INSERT INTO categories
        (
          nama_kategori,
          icon
        )
        VALUES (?, ?)
        `,
        [
          request.nama_kategori,
          icon || null,
        ]
      )
    }


    if (
      request.action_type ===
      "update"
    ) {

      await db.query(
        `
        UPDATE categories
        SET
          nama_kategori = ?,
          icon = ?
        WHERE id = ?
        `,
        [
          request.nama_kategori,
          icon || null,
          request.category_id,
        ]
      )
    }


    if (
      request.action_type ===
      "delete"
    ) {

      await db.query(
        `
        DELETE FROM categories
        WHERE id = ?
        `,
        [request.category_id]
      )
    }

    await db.query(
      `
      UPDATE category_requests
      SET
        status = 'approved',
        icon = ?
      WHERE id = ?
      `,
      [
        icon || null,
        id,
      ]
    )

    await createAuditLog(
      req.user.id,
      "approve_category_request",
      `Approve request ${request.action_type} kategori ${request.nama_kategori}`
    )

    res.json({
      message:
        "Request berhasil diapprove",
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: error.message,
    })
  }
}


export async function rejectCategoryRequest(
  req,
  res
) {
  try {

    const { id } = req.params

    const [rows] = await db.query(
      `
      SELECT *
      FROM category_requests
      WHERE id = ?
      `,
      [id]
    )

    const request =
      rows[0]

    await db.query(
      `
      UPDATE category_requests
      SET status = 'rejected'
      WHERE id = ?
      `,
      [id]
    )

    await createAuditLog(
      req.user.id,
      "reject_category_request",
      `Reject request ${request.nama_kategori}`
    )

    res.json({
      message:
        "Request berhasil ditolak",
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: error.message,
    })
  }
}
