const jwt = require('jsonwebtoken')

function validateUser(request) {
  const jwtSecretKey = process.env.JWT_SECRET
  const token = request.headers['jwt-token']
  try {
    const user = jwt.verify(token, jwtSecretKey)
    return (user) ? user : false
  } catch (error) {
    return false;
  }
}

module.exports = validateUser