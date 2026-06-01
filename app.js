import express from "express"
import cors from "cors"
import http from "http" 
import { Server } from "socket.io"
import authRoutes from "./routes/authRoute.js"
import reportRoutes from "./routes/laporanRoute.js"
import commentRoutes from "./routes/commentRoute.js"
import userRoutes from "./routes/userRoute.js"
import categoryRoutes from "./routes/categoryRoute.js"
import likeRoutes from "./routes/likeRoute.js"
import locationRoutes from "./routes/locationRoutes.js"
import notifRoutes from "./routes/notifRoute.js"
import chatRoutes from "./routes/chatRoute.js"
import categoryReqRoutes from "./routes/categoryReqRoute.js"
import auditLogRoutes from "./routes/auditLogRoute.js"
import profileRoutes from "./routes/profileRoute.js"

const app = express()

// HTTP SERVER
const server =
  http.createServer(app)

// SOCKET IO
export const io =
  new Server(server, {
    cors: {
      origin:
        "http://localhost:3000",

      methods: [
        "GET",
        "POST",
      ],
    },
  })

// SOCKET CONNECTION
io.on(
  "connection",
  (socket) => {

    console.log(
      "User connected:",
      socket.id
    )

    socket.on(
      "join_room",
      (userId) => {

        socket.join(
          userId.toString()
        )

        console.log(
          `User ${userId} joined room`
        )
      }
    )

    socket.on(
      "disconnect",
      () => {

        console.log(
          "User disconnected"
        )
      }
    )
  }
)


app.use(express.json())
app.use("/uploads", express.static("uploads"))
app.use(cors())

app.use("/auth", authRoutes)
app.use("/location", locationRoutes)
app.use("/report", reportRoutes)
app.use("/comment", commentRoutes)
app.use("/like", likeRoutes)
app.use("/users", userRoutes)
app.use("/categories", categoryRoutes)
app.use("/notifications", notifRoutes)
app.use("/chat", chatRoutes)
app.use("/category-requests", categoryReqRoutes)
app.use("/audit-logs", auditLogRoutes)
app.use("/profile", profileRoutes)

server.listen(4000, () => {
  console.log("Server jalan 🚀")
})