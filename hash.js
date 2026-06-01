import bcrypt from "bcrypt"

const password = "vano"

bcrypt.hash(password, 10).then(console.log)