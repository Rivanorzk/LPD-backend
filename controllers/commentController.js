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
      ORDER BY c.created_at DESC
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