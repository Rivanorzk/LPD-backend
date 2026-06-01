import db from "../lib/database.js"

export async function toggleLike(
  req,
  res
) {
  try {
    const { report_id } = req.body


    const [rows] = await db.query(
      `
      SELECT * FROM likes
      WHERE report_id=?
      AND user_id=?
      `,
      [report_id, req.user.id]
    )


    if (rows.length > 0) {
      await db.query(
        `
        DELETE FROM likes
        WHERE report_id=?
        AND user_id=?
        `,
        [report_id, req.user.id]
      )

      return res.json({
        liked: false,
      })
    }


    await db.query(
      `
      INSERT INTO likes(
        report_id,
        user_id
      )
      VALUES (?,?)
      `,
      [report_id, req.user.id]
    )

    res.json({
      liked: true,
    })
  } catch (error) {
    console.log(error)

    res.status(500).json({
      message: error.message,
    })
  }
}