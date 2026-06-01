

import db from "../lib/database.js"
import puppeteer from "puppeteer"
import { createAuditLog } from "./auditLogController.js"

export async function createReport(req, res) {
  const {
    header,
    body,
    category_id,
    location,
    longitude,
    latitude,
  } = req.body

  const image = req.file
    ? req.file.filename
    : null

  const [result] = await db.query(
    `
    INSERT INTO report
    (header, body, user_id, kategori_id, location, longitude, latitude, image)
    VALUES (?,?,?,?,?,?,?,?)
    `,
    [
      header,
      body,
      req.user.id,
      category_id,
      location,
      longitude,
      latitude,
      image,
    ]
  )

  await db.query(
    `
    INSERT INTO notifications
    (user_id, report_id, title, message, status)
    VALUES (?,?,?,?,?)
    `,
    [
      req.user.id,
      result.insertId,
      header,
      "Laporan berhasil dibuat dan menunggu verifikasi admin",
      "Menunggu",
    ]
  )
  await createAuditLog( req.user.id, "create_report", `Membuat laporan baru dengan judul ${header}` )

  res.json({
    message: "Report dibuat",
  })
}

export async function getAllReport(
  req,
  res
) {
  try {

    const { category } = req.query

    let query = `
      SELECT 
        r.*,
        u.username,
        u.image AS profile_image,
        c.nama_kategori,

        COUNT(DISTINCT l.id) AS total_likes,
        COUNT(DISTINCT cm.id) AS total_comments,

        MAX(
          CASE
            WHEN l.user_id = ?
            THEN 1
            ELSE 0
          END
        ) AS liked_by_user

      FROM report r

      LEFT JOIN users u
      ON r.user_id = u.id

      LEFT JOIN categories c
      ON r.kategori_id = c.id

      LEFT JOIN likes l
      ON r.id = l.report_id

      LEFT JOIN comments cm
      ON r.id = cm.report_id
    `

    const params = [req.user.id]


    if (category) {
      query += `
        WHERE r.kategori_id = ?
      `

      params.push(category)
    }

    query += `
      GROUP BY r.id

      ORDER BY
        r.created_at DESC
    `

    const [data] = await db.query(
      query,
      params
    )

    res.json(data)

  } catch (error) {

    console.log(
      "GET REPORT ERROR:",
      error
    )

    res.status(500).json({
      message: error.message,
    })
  }
}


export async function updateStatus(
  req,
  res
) {
  try {

    const { id } = req.params
    const { status } = req.body

    await db.query(
      `
      UPDATE report
      SET status = ?, verified_at = NOW()
      WHERE id = ?
      `,
      [status, id]
    )

    const [reports] = await db.query(
      `
      SELECT *
      FROM report
      WHERE id = ?
      `,
      [id]
    )

    const report = reports[0]

    await db.query(
      `
      INSERT INTO notifications
      (
        user_id,
        report_id,
        title,
        message,
        status
      )
      VALUES (?,?,?,?,?)
      `,
      [
        report.user_id,
        report.id,
        report.header,
        `Status laporan berubah menjadi ${status}`,
        status,
      ]
    )

    await createAuditLog(
      req.user.id,
      "update_report_status",
      `Mengupdate status laporan dengan ID ${id} menjadi ${status}`
    )

    res.json({
      message:
        "Status diupdate",
    })

  } catch (error) {

    console.log(
      "UPDATE STATUS ERROR:",
      error
    )

    res.status(500).json({
      message:
        error.message,
    })
  }
}

export async function deleteReport(req, res) {
  const { id } = req.params

  await db.query(
    "DELETE FROM report WHERE id=?",
    [id]
  )

  res.json({
    message: "Report dihapus",
  })
  await createAuditLog( req.user.id, "delete_report", `Menghapus laporan dengan ID ${id}` )
}

export async function getReportById(req, res) {
  try {
    const [rows] = await db.query(
      `
      SELECT 
        r.*,
        u.username,
        u.image AS profile_image,
        c.nama_kategori,

        COUNT(DISTINCT l.id) AS total_likes,
        COUNT(DISTINCT cm.id) AS total_comments,

        MAX(
          CASE
            WHEN l.user_id = ?
            THEN 1
            ELSE 0
          END
        ) AS liked_by_user

      FROM report r

      LEFT JOIN users u
      ON r.user_id = u.id

      LEFT JOIN categories c
      ON r.kategori_id = c.id

      LEFT JOIN likes l
      ON r.id = l.report_id

      LEFT JOIN comments cm
      ON r.id = cm.report_id

      WHERE r.id = ?

      GROUP BY r.id
      `,
      [req.user.id, req.params.id]
    )

    res.json(rows[0])
  } catch (error) {
    console.log(error)

    res.status(500).json({
      message: error.message,
    })
  }
}

export async function reportPdf(
  req,
  res
) {
  try {

    const { id } =
      req.params

    const [rows] =
      await db.query(
        `
        SELECT
          r.*,
          u.username,
          c.nama_kategori
        FROM report r
        LEFT JOIN users u
          ON r.user_id = u.id
        LEFT JOIN categories c
          ON r.kategori_id = c.id
        WHERE r.id = ?
        `,
        [id]
      )

    const report =
      rows[0]

    if (!report) {
      return res.status(404).json({
        message:
          "Laporan tidak ditemukan",
      })
    }

    const browser =
      await puppeteer.launch({
        headless: true,
      })

    const page =
      await browser.newPage()

      await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
      <meta charset="utf-8">
      <style>
      body{
        font-family: Arial, sans-serif;
        background:#fff;
        padding:20px;
        color:#1e293b;
        font-size:13px;
      }

      .header{
        text-align:center;
        border-bottom:1px solid #e2e8f0;
        padding-bottom:12px;
        margin-bottom:12px;
      }

      .logo{
        height:70px;
        margin-bottom:8px;
      }

      .title{
        font-size:22px;
        font-weight:bold;
      }

      .subtitle{
        font-size:11px;
        color:#64748b;
      }

      .card{
        background:#f8fafc;
        border-radius:10px;
        padding:15px;
        margin-bottom:12px;
      }

      .card h3{
        margin-top:0;
        margin-bottom:10px;
      }

      .grid{
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:10px;
      }

      .label{ 
      font-size:10px; 
      color:#64748b; 
      text-transform:uppercase; 
      } 

      .value{ 
      font-size:13px; 
      font-weight:600; 
      } 

      .badge{ 
      display:inline-block; 
      padding:6px 14px; 
      border-radius:999px; 
      font-size:12px; 
      font-weight:bold; 
      }

      .badge-selesai{ 
      background:#dcfce7; 
      color:#166534; 
      } 

      .badge-proses{ 
      background:#fef3c7; 
      color:#92400e; 
      } 

      .badge-menunggu{ 
      background:#dbeafe; 
      color:#1d4ed8; 
      }

      .report-title{
        font-size:20px;
        font-weight:bold;
        margin-top:12px;
      }

      .line{
        width:70px;
        height:4px;
        background:#2563eb;
        margin-top:6px;
        margin-bottom:10px;
        border-radius:10px;
      }

      .image{ 
      width:100%; 
      max-width:340px; 
      border-radius:10px; 
      margin-top:20px; }

      .desc{
        background:#f8fafc;
        border:1px solid #e2e8f0;
        border-radius:10px;
        padding:15px;
        margin-top:10px;
        white-space:pre-line;
        line-height:1.6;
        font-size:12px;
      }

      .footer{
        margin-top:25px;
        border-top:1px solid #e2e8f0;
        padding-top:15px;
      }

      .footer-flex{
        display:flex;
        justify-content:space-between;
      }

      .signature-line{
        width:120px;
        border-top:1px solid #cbd5e1;
        margin:25px 0 10px auto;
      }
      </style>
      </head>

      <body>
      <div class="container">

        <div class="header">
          <img
            class="logo"
            src="http://localhost:4000/uploads/logo.png"
          />

          <div class="title">
            SISTEM PENGADUAN MASYARAKAT
          </div>

          <div class="subtitle">
            Dokumen Laporan Pengaduan Warga
          </div>
        </div>

        <div class="card">
          <h3>Informasi Laporan</h3>

          <div class="grid">
            <div>
              <div class="label">Tanggal Laporan</div>
              <div class="value">
                ${new Date(report.created_at).toLocaleDateString("id-ID")}
              </div>
            </div>

            <div>
              <div class="label">Pelapor</div>
              <div class="value">${report.username}</div>
            </div>

            <div>
              <div class="label">Kategori</div>
              <div class="value">${report.nama_kategori}</div>
            </div>

            <div>
              <div class="label">Lokasi</div>
              <div class="value">${report.location}</div>
            </div>
          </div>
        </div>

        <div>
          <span class="
            badge
            ${
              report.status === "Selesai"
                ? "badge-selesai"
                : report.status === "Dalam Proses"
                ? "badge-proses"
                : "badge-menunggu"
            }
          ">
            ${report.status}
          </span>
        </div>

        <div class="report-title">
          ${report.header}
        </div>

        <div class="line"></div>

        ${
          report.image
            ? `
            <img
              class="image"
              src="http://localhost:4000/uploads/${report.image}"
            />
          `
            : ""
        }

        <div class="desc">${report.body?.trim()}</div>

        <div class="footer">
          <div class="footer-flex">

            <div>
              <small>
                Dokumen resmi - tidak memerlukan tanda tangan basah
              </small>
            </div>

            <div style="text-align:right;">
              <div>
                ${new Date().toLocaleDateString("id-ID")}
              </div>

              <div class="signature-line"></div>

              <strong>
                Administrator Sistem
              </strong>

              <br>

              <small>
                Tanda Tangan Digital
              </small>
            </div>

          </div>
        </div>

      </div>
      </body>
      </html>
      `)

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "5mm",
        right: "5mm",
        bottom: "5mm",
        left: "5mm"
      }
    })

    await browser.close()

    res.setHeader(
      "Content-Type",
      "application/pdf"
    )

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=laporan-${id}.pdf`
    )

    res.send(pdf)

  } catch (error) {

    console.log(
      "PDF ERROR:",
      error
    )

    res.status(500).json({
      message:
        "Gagal generate PDF",
    })
  }
}

export async function getReportPublic(
  req,
  res
) {
  try {
    const [rows] = await db.query(
      `
      SELECT
        r.*,
        u.username,
        u.image AS profile_image,
        c.nama_kategori
      FROM report r
      LEFT JOIN users u
        ON r.user_id = u.id
      LEFT JOIN categories c
        ON r.kategori_id = c.id
      WHERE r.id = ?
      `,
      [req.params.id]
    )

    if (!rows.length) {
      return res.status(404).json({
        message:
          "Laporan tidak ditemukan",
      })
    }

    res.json(rows[0])

  } catch (error) {
    console.log(error)

    res.status(500).json({
      message: error.message,
    })
  }
}