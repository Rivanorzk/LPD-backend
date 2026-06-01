

import db from "../lib/database.js"


export async function getAuditLogs(
  req,
  res
) {
  try {

    const [rows] = await db.query(
      `
      SELECT
        audit_logs.*,
        users.username,
        users.role
      FROM audit_logs

      LEFT JOIN users
      ON audit_logs.user_id = users.id

      ORDER BY audit_logs.id DESC
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


export async function createAuditLog(
  user_id,
  action,
  description
) {

  try {

    await db.query(
      `
      INSERT INTO audit_logs
      (
        user_id,
        action,
        description
      )
      VALUES (?, ?, ?)
      `,
      [
        user_id,
        action,
        description,
      ]
    )

  } catch (error) {

    console.log(
      "Audit log error:",
      error
    )
  }
}

