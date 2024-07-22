const jwt =  require('jsonwebtoken')
const bcypt =  require('bcrypt')
const express = require('express')

const mysql =  require("../helpers/mysql");

const router = express.Router()

router.post("/", async (request, response) => {
  const jwtSecretKey = process.env.JWT_SECRET

  const isStaff = request.query.type === 'staff'
  var password = null
  if (isStaff) password = request.body.password

  const { organization, identifier } = request.body

  if (!organization || !identifier || (isStaff && !password)) {
    return response.status(401).json({ message: 'invalid login credentials' })
  }

  // TODO: check password
  const userData = await mysql.sendQuery(`SELECT password, isStaff FROM accounts WHERE organization = '${organization}' AND identifier = '${identifier}'`)

  if (!userData.length) {
    return response.status(401).json({ message: 'invalid login credentials' })
  }

  if (isStaff != userData[0].isStaff) {
    return response.status(401).json({ message: 'invalid login credentials' })
  }

  if (isStaff && !await bcypt.compare(password, userData[0].password)) {
    return response.status(401).json({ message: 'invalid login credentials' })
  }
  let data = {
    signInTime: Date.now(),
    organization,
    identifier,
    isStaff
  }

  const token = jwt.sign(data, jwtSecretKey)
  response.status(200).json({ message: 'valid', token })
})

router.get("/", (request, response) => {
  const jwtSecretKey = process.env.JWT_SECRET
  const token = request.headers['jwt-token']
  try {
    const user = jwt.verify(token, jwtSecretKey)
    if (user) {
      return response.status(200).json({ message: 'valid', user })
    } else {
      return response.status(401).json({ message: 'error' })
    }
  } catch (error) {
    return response.status(401).json({ message: 'error' })
  }
})

module.exports = router