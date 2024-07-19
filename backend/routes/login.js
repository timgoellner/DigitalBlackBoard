const express = require("express")
const jwt = require('jsonwebtoken')
const router = express.Router()

router.post("/", (request, response) => {
  const jwtSecretKey = process.env.JWT_SECRET

  const isStaff = request.query.type === 'staff'
  var identifier = null
  if (isStaff) identifier = request.body

  const { username, password } = request.body

  // TODO: check password
  if ((password !== '1234' && !isStaff) || (password !== '9876' && isStaff)) {
    return response.status(401).json({ message: 'invalid password' })
  }
  let data = {
    signInTime: Date.now(),
    username,
  }

  const token = jwt.sign(data, jwtSecretKey)
  response.status(200).json({ message: 'valid', token })
})

router.get("/", (request, response) => {
  const jwtSecretKey = process.env.JWT_SECRET
  const token = request.headers['jwt-token']
  try {
    const verified = jwt.verify(token, jwtSecretKey)
    console.log(verified)
    if (verified) {
      return response.status(200).json({ message: 'valid' })
    } else {
      return response.status(401).json({ message: 'error' })
    }
  } catch (error) {
    return response.status(401).json({ message: 'error' })
  }
})

module.exports = router;