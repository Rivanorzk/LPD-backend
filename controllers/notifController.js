import db from "../lib/database.js"

export async function getNotifications(
  req,
  res
) {
  try {

    const [rows] = await db.query(
      `
      SELECT *
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [req.user.id]
    )

    res.json(rows)

  } catch (error) {
    console.log(error)

    res.status(500).json({
      message: error.message,
    })
  }
}

export async function readNotifications(
  req,
  res
) {
  try {

    await db.query(
      `
      UPDATE notifications
      SET is_read = TRUE
      WHERE user_id = ?
      `,
      [req.user.id]
    )

    res.json({
      message: "Notifikasi dibaca",
    })

  } catch (error) {
    console.log(error)

    res.status(500).json({
      message: error.message,
    })
  }
}

