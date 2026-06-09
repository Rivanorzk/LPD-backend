import db from "../lib/database.js"
import { io } from "../app.js"


export async function sendMessage(
  req,
  res
) {

  try {

    const {
      receiver_id,
      message,
    } = req.body

    const [result] =
      await db.query(
        `
        INSERT INTO chats
        (
          sender_id,
          receiver_id,
          message
        )
        VALUES (?, ?, ?)
        `,
        [
          req.user.id,
          receiver_id,
          message,
        ]
      )

    const payload = {
      id: result.insertId,
      sender_id: req.user.id,
      sender_role: req.user.role,
      receiver_id,
      message,
      created_at:
        new Date(),
    }

    io.to(receiver_id.toString())
      .emit(
        "receive_message",
        payload
      )

    io.to(req.user.id.toString())
      .emit(
        "receive_message",
        payload
      )

    res.json({
      message:
        "Pesan berhasil dikirim",
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: error.message,
    })
  }
}



export async function getMessages(
  req,
  res
) {

  try {

    const { userId } =
      req.params

    const [messages] =
      await db.query(
        `
        SELECT
          c.*,
          s.username
          AS sender_name

        FROM chats c

        JOIN users s
        ON c.sender_id = s.id

        WHERE
        (
          c.sender_id = ?
          AND
          c.receiver_id = ?
        )

        OR

        (
          c.sender_id = ?
          AND
          c.receiver_id = ?
        )

        ORDER BY c.created_at ASC
        `,
        [
          req.user.id,
          userId,

          userId,
          req.user.id,
        ]
      )

    res.json(messages)

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: error.message,
    })
  }
}


export async function readMessages(
  req,
  res
) {

  try {

    const { userId } =
      req.params

    await db.query(
      `
      UPDATE chats
      SET is_read = TRUE

      WHERE
      sender_id = ?
      AND receiver_id = ?
      `,
      [
        userId,
        req.user.id,
      ]
    )

    res.json({
      message:
        "Pesan dibaca",
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: error.message,
    })
  }
}


export async function getUnreadCount(
  req,
  res
) {

  try {

    const [rows] =
      await db.query(
        `
        SELECT
          sender_id,

          COUNT(*) AS unread_count

        FROM chats

        WHERE
        receiver_id = ?
        AND is_read = FALSE

        GROUP BY sender_id
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

export async function getAdminUnreadCount(
  req,
  res
) {

  try {

    const [rows] =
      await db.query(
        `
        SELECT
          sender_id,
          COUNT(*) AS unread_count
        FROM chats
        WHERE
          receiver_id = ?
          AND is_read = FALSE
        GROUP BY sender_id
        `,
        [req.user.id]
      )

    res.json(rows)

  } catch (error) {

    res.status(500).json({
      message:
        error.message,
    })
  }
}

export async function getSuperadminUnreadCount(
  req,
  res
) {

  try {

    const [rows] =
      await db.query(
        `
        SELECT
          sender_id,
          COUNT(*) AS unread_count

        FROM chats

        WHERE
          receiver_id = ?
          AND is_read = FALSE

        GROUP BY sender_id
        `,
        [req.user.id]
      )

    res.json(rows)

  } catch (error) {

    res.status(500).json({
      message:
        error.message,
    })
  }
}