const jwt = require('jsonwebtoken')
const mysql = require('./mysql')
const escape = require("mysql2").escape

async function validateUser(request) {
  const jwtSecretKey = process.env.JWT_SECRET
  const token = request.headers['jwt-token']
  try {
    const user = jwt.verify(token, jwtSecretKey)

    if (user && !user.isStaff) {
      const quarantine = await mysql.sendQuery(`SELECT * FROM organizations WHERE name = ${escape(user.organization)}`)
      if (quarantine[0].quarantine === 1) return false
    }

    return (user) ? user : false
  } catch (error) {
    return false;
  }
}

module.exports = validateUser