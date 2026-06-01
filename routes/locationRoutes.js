import express from "express"
import axios from "axios"

const router = express.Router()

router.get("/reverse", async (req, res) => {
  try {
    const { lat, lon } = req.query

    const response = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          format: "json",
          lat,
          lon,
        },

        headers: {
          "Accept-Language": "id",
          "User-Agent":
            "pengaduan-masyarakat-app",
        },
      }
    )

    res.json(response.data)
  } catch (error) {
    console.log(error)

    res.status(500).json({
      message: "Gagal mendapatkan lokasi",
    })
  }
})

export default router