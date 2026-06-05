import db from "../lib/database.js"

export async function createComment(req, res) {
  try {
    const { report_id, body } = req.body

    await db.query(
      `
      INSERT INTO comments (
        report_id,
        user_id,
        body
      )
      VALUES (?, ?, ?)
      `,
      [
        report_id,
        req.user.id,
        body,
      ]
    )

    res.json({
      message: "Komentar berhasil dibuat",
    })
  } catch (error) {
    console.log(error)

    res.status(500).json({
      message: error.message,
    })
  }
}

export async function updateComment(req, res) {
  try {
    const { id } = req.params
    const { body } = req.body

    const [comments] = await db.query(
      `
      SELECT *
      FROM comments
      WHERE id = ?
      `,
      [id]
    )

    if (!comments.length) {
      return res.status(404).json({
        message: "Komentar tidak ditemukan",
      })
    }

    if (comments[0].user_id !== req.user.id) {
      return res.status(403).json({
        message: "Tidak memiliki akses",
      })
    }

    await db.query(
      `
      UPDATE comments
      SET body = ?
      WHERE id = ?
      `,
      [body, id]
    )

    res.json({
      message: "Komentar berhasil diupdate",
    })
  } catch (error) {
    console.log(error)

    res.status(500).json({
      message: error.message,
    })
  }
}

export async function deleteComment(req, res) {
  try {
    const { id } = req.params

    const [comments] = await db.query(
      `
      SELECT *
      FROM comments
      WHERE id = ?
      `,
      [id]
    )

    if (!comments.length) {
      return res.status(404).json({
        message: "Komentar tidak ditemukan",
      })
    }

    if (
      comments[0].user_id !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Tidak memiliki akses",
      })
    }

    await db.query(
      `
      DELETE FROM comments
      WHERE id = ?
      `,
      [id]
    )

    res.json({
      message: "Komentar berhasil dihapus",
    })
  } catch (error) {
    console.log(error)

    res.status(500).json({
      message: error.message,
    })
  }
}

export async function replyComment(req, res) {
  try {
    const { id } = req.params
    const { body } = req.body

    const [comments] = await db.query(
      `
      SELECT *
      FROM comments
      WHERE id = ?
      `,
      [id]
    )

    if (!comments.length) {
      return res.status(404).json({
        message: "Komentar tidak ditemukan",
      })
    }

    await db.query(
      `
      INSERT INTO comments (
        report_id,
        parent_id,
        user_id,
        body
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        comments[0].report_id,
        id,
        req.user.id,
        body,
      ]
    )

    res.json({
      message: "Balasan berhasil dibuat",
    })
  } catch (error) {
    console.log(error)

    res.status(500).json({
      message: error.message,
    })
  }
}

export async function getCommentByReport(req, res) {
  try {
    const [rows] = await db.query(
      `
      SELECT
        c.*,
        u.username,
        u.image
      FROM comments c
      LEFT JOIN users u
      ON c.user_id = u.id
      WHERE c.report_id = ?
      ORDER BY
        COALESCE(c.parent_id, c.id),
        c.created_at ASC
      `,
      [req.params.id]
    )

    res.json(rows)
  } catch (error) {
    console.log(error)

    res.status(500).json({
      message: error.message,
    })
  }
}