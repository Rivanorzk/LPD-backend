
import jwt from "jsonwebtoken"

const roleHierarchy = {
  user: 1,
  admin: 2,
  superadmin: 3
}

export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization

  const token =
    authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({
      message: "Token tidak ada",
    })
  }

  try {
    const decoded = jwt.verify(
      token,
      "hypersecret"
    )

    req.user = decoded

    next()
  } catch (err) {
    return res.status(403).json({
      message: "Token tidak valid",
    })
  }
}

export function checkRole(minRole) {
  return (req, res, next) => {
    const userRole = req.user.role

    if (roleHierarchy[userRole] < roleHierarchy[minRole]) {
      return res.status(403).json({ message: "Akses ditolak" })
    }

    next()
  }
}

export default function verifySuperadmin(
  req,
  res,
  next
) {


  if (!req.user) {
    return res.status(401).json({
      message:
        "Unauthorized",
    })
  }


  if (
    req.user.role !==
    "superadmin"
  ) {
    return res.status(403).json({
      message:
        "Akses ditolak",
    })
  }

  next()
}

